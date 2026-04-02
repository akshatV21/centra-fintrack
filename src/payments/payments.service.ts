import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreatePaymentDto } from './dtos/create-payment.dto'
import { ERR_CODES, LEDGER_ID } from 'src/utils/constants'
import { PaymentType } from 'generated/prisma/enums'
import { Prisma } from 'generated/prisma/client'
import { InvalidCategoryError } from './payments.errors'
import { ListPaymentsDto } from './dtos/list-payments.dto'

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
    } catch (error) {
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
}
