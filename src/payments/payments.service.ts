import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreatePaymentDto } from './dtos/create-payment.dto'
import { DOUBLE_SHIFT, ERR_CODES, LEDGER_ID } from 'src/utils/constants'
import { PaymentType } from 'generated/prisma/enums'
import { Prisma } from 'generated/prisma/client'
import { InvalidCategoryError, PaymentNotFoundError } from './payments.errors'
import { ListPaymentsDto } from './dtos/list-payments.dto'
import { UpdateAmountDto } from './dtos/update-payment.dto'
import { UpdateTypeDto } from './dtos/update-type.dto'
import { PaymentsTrendDto } from './dtos/aggregate.dto'
import { ChartData, Interval, TrendData } from 'src/utils/types'

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreatePaymentDto) {
    try {
      const isExpense = data.type === PaymentType.expense

      const [payment] = await this.db.$transaction([
        this.db.payment.create({ data }),
        this.db.ledger.upsert({
          where: { id: LEDGER_ID },
          create: {
            expense: isExpense ? data.amount : 0,
            income: isExpense ? 0 : data.amount,
            balance: isExpense ? -data.amount : data.amount,
          },
          update: {
            expense: { increment: isExpense ? data.amount : 0 },
            income: { increment: isExpense ? 0 : data.amount },
            balance: isExpense ? { decrement: data.amount } : { increment: data.amount },
          },
        }),
      ])

      return payment
    } catch (error: any) {
      if (error.code === ERR_CODES.FOREIGN_KEY) throw new InvalidCategoryError()
      throw error
    }
  }

  async list(query: ListPaymentsDto) {
    const limit = query.limit ?? 20

    const where: Prisma.PaymentWhereInput = { date: {} }

    if (query.type) where.type = query.type
    if (query.categoryId) where.categoryId = query.categoryId
    if (query.from || query.to) {
      where.date = {}

      if (query.from) where.date.gte = query.from
      if (query.to) where.date.lte = query.to
    }

    const payments = await this.db.payment.findMany({
      where,
      take: limit + 1,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: { category: { select: { name: true } } },
      cursor: query.cursor ? { id: query.cursor } : undefined,
    })

    let cursor: string | null = null
    if (payments.length > limit) {
      const next = payments.pop()!
      cursor = next.id
    }

    return { payments, cursor }
  }

  async amount(data: UpdateAmountDto) {
    const payment = await this.db.payment.findUnique({
      where: { id: data.paymentId },
      select: { amount: true, type: true },
    })
    if (!payment) throw new PaymentNotFoundError()

    const diff = data.amount - payment.amount
    const isExpense = payment.type === PaymentType.expense

    await this.db.$transaction([
      this.db.payment.update({ where: { id: data.paymentId }, data: { amount: data.amount } }),
      this.db.ledger.update({
        where: { id: LEDGER_ID },
        data: {
          income: isExpense ? undefined : { increment: diff },
          expense: isExpense ? { increment: diff } : undefined,
          balance: { increment: isExpense ? -diff : diff },
        },
      }),
    ])
  }

  async type(data: UpdateTypeDto) {
    const payment = await this.db.payment.findUnique({
      where: { id: data.paymentId },
      select: { amount: true, type: true },
    })

    if (!payment) throw new PaymentNotFoundError()
    if (payment.type === data.type) return

    const toExpense = data.type === PaymentType.expense

    await this.db.$transaction([
      this.db.payment.update({ where: { id: data.paymentId }, data: { type: data.type } }),
      this.db.ledger.update({
        where: { id: LEDGER_ID },
        data: {
          income: toExpense ? { decrement: payment.amount } : { increment: payment.amount },
          expense: toExpense ? { increment: payment.amount } : { decrement: payment.amount },
          balance: { increment: DOUBLE_SHIFT * (toExpense ? -payment.amount : payment.amount) },
        },
      }),
    ])
  }

  async summary() {
    const now = new Date()

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const day = now.getDay() || 7 // if sunday (0), convert it to last (7)
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1)
    weekStart.setHours(0, 0, 0, 0)

    const [ledger, monthData, weekData] = await Promise.all([
      this.db.ledger.findUnique({ where: { id: LEDGER_ID }, select: { balance: true, expense: true, income: true } }),
      this.db.payment.groupBy({ by: ['type'], where: { date: { gte: monthStart } }, _sum: { amount: true } }),
      this.db.payment.groupBy({ by: ['type'], where: { date: { gte: weekStart } }, _sum: { amount: true } }),
    ])

    const parse = (data: any[]) => {
      let income = 0
      let expense = 0

      for (const group of data) {
        if (group.type === PaymentType.income) income = group._sum.amount || 0
        if (group.type === PaymentType.expense) expense = group._sum.amount || 0
      }

      return { income, expense, balance: income - expense }
    }

    return { allTime: ledger, month: parse(monthData), week: parse(weekData) }
  }

  async trend(query: PaymentsTrendDto) {
    const chart = new Map<string, ChartData>()
    const { start, end } = this.snapToBoundaries(new Date(query.from), new Date(query.to), query.interval)

    let current = new Date(start)

    while (current <= end) {
      chart.set(current.toISOString(), {
        period: new Date(current),
        income: 0,
        expense: 0,
      })

      if (query.interval === Interval.month) current.setMonth(current.getMonth() + 1)
      else current.setDate(current.getDate() + 7)
    }

    const interval = Prisma.raw(`'${query.interval}'`)
    const category = query.categoryId ? Prisma.sql`AND "categoryId" = ${query.categoryId}` : Prisma.empty

    const raw = await this.db.$queryRaw<TrendData[]>`
      SELECT 
        DATE_TRUNC(${interval}, date) as period,
        type,
        SUM(amount) as total
      FROM "Payment"
      WHERE date >= ${start} 
        AND date <= ${end}
        ${category}
      GROUP BY period, type
      ORDER BY period ASC;`

    for (const row of raw) {
      const key = row.period.toISOString()
      const entry = chart.get(key)!

      if (row.type === PaymentType.income) entry.income = Number(row.total)
      else entry.expense = Number(row.total)
    }

    return Array.from(chart.values()).sort((a, b) => a.period.getTime() - b.period.getTime())
  }

  private snapToBoundaries(from: Date, to: Date, interval: Interval) {
    const start = new Date(from)
    const end = new Date(to)

    if (interval === Interval.month) {
      start.setUTCDate(1)
      start.setUTCHours(0, 0, 0, 0)

      end.setUTCMonth(end.getUTCMonth() + 1)
      end.setUTCDate(0)
      end.setUTCHours(23, 59, 59, 999)
    }

    if (interval === Interval.week) {
      const startDay = start.getUTCDay() || 7 // Convert Sunday(0) to 7
      start.setUTCDate(start.getUTCDate() - startDay + 1)
      start.setUTCHours(0, 0, 0, 0)

      const endDay = end.getUTCDay() || 7
      end.setUTCDate(end.getUTCDate() + (7 - endDay))
      end.setUTCHours(23, 59, 59, 999)
    }

    return { start, end }
  }
}
