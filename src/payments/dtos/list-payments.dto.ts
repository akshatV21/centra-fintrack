import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { PaymentType } from 'generated/prisma/enums'
import { CursorPaginationDto } from 'src/utils/pagination'

export class ListPaymentsDto extends CursorPaginationDto {
  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string

  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType

  @IsOptional()
  @IsString()
  categoryId?: string
}
