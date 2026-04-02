import { Body, Controller, Post } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreatePaymentDto } from './dtos/create-payment.dto'
import { HttpResponse } from 'src/utils/types'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @Auth({ roles: ['admin'] })
  async httpCreatePayment(@Body() data: CreatePaymentDto): HttpResponse {
    const payment = await this.paymentsService.create(data)
    return { success: true, message: 'Payment created successfully.', data: { payment } }
  }
}
