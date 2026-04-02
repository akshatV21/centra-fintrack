import { Transform } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { PaymentType } from 'generated/prisma/enums'

export class UpdateTypeDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string

  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType
}
