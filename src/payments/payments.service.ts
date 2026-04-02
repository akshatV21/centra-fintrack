import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreatePaymentDto } from './dtos/create-payment.dto'
import { LEDGER_ID } from 'src/utils/constants'
import { PaymentType } from 'generated/prisma/enums'
import { Prisma } from 'generated/prisma/client'

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreatePaymentDto) {
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
  }
}
