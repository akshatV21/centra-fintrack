import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreatePaymentDto } from './dtos/create-payment.dto'
import { HttpResponse } from 'src/utils/types'
import { ListPaymentsDto } from './dtos/list-payments.dto'
import { UpdateAmountDto } from './dtos/update-payment.dto'
import { UpdateTypeDto } from './dtos/update-type.dto'
import { PaymentsTrendDto } from './dtos/aggregate.dto'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @Auth({ roles: ['admin'] })
  async httpCreatePayment(@Body() data: CreatePaymentDto): HttpResponse {
    const payment = await this.paymentsService.create(data)
    return { success: true, message: 'Payment created successfully.', data: { payment } }
  }

  @Get('list')
  @Auth({ roles: ['analyst', 'admin'] })
  async httpListPayments(@Query() query: ListPaymentsDto): HttpResponse {
    const result = await this.paymentsService.list(query)
    return { success: true, message: 'Payments listed successfully.', data: result }
  }

  @Patch('amount')
  @Auth({ roles: ['admin'] })
  async httpUpdateAmount(@Body() data: UpdateAmountDto): HttpResponse {
    await this.paymentsService.amount(data)
    return { success: true, message: 'Amount updated successfully.' }
  }

  @Patch('type')
  @Auth({ roles: ['admin'] })
  async httpUpdateType(@Body() data: UpdateTypeDto): HttpResponse {
    await this.paymentsService.type(data)
    return { success: true, message: 'Type updated successfully.' }
  }

  @Get('summary')
  @Auth()
  async httpGetSummary(): HttpResponse {
    const summary = await this.paymentsService.summary()
    return { success: true, message: 'Summary fetched successfully.', data: { summary } }
  }

  @Get('trend')
  @Auth()
  async httpGetTrend(@Query() query: PaymentsTrendDto): HttpResponse {
    const chart = await this.paymentsService.trend(query)
    return { success: true, message: 'Trend fetched successfully.', data: { chart } }
  }
}
