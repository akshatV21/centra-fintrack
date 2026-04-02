import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { Role } from 'generated/prisma/enums'

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role
}
