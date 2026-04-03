import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Interval } from 'src/utils/types'

export class PaymentsTrendDto {
  @IsNotEmpty()
  @IsDateString()
  from: string

  @IsNotEmpty()
  @IsDateString()
  to: string

  @IsNotEmpty()
  @IsEnum(Interval)
  interval: Interval

  @IsOptional()
  @IsString()
  categoryId?: string
}
