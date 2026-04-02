import { Transform } from 'class-transformer'
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { PaymentType } from 'generated/prisma/enums'

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  amount: number

  @IsNotEmpty()
  @IsDateString()
  date: string

  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType

  @IsNotEmpty()
  @IsString()
  categoryId: string
}
