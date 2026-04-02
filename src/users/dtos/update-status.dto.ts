import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { Status } from 'generated/prisma/enums'

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsEnum(Status)
  status: Status
}
