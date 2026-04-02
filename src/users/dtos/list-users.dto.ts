import { IsEnum, IsOptional } from 'class-validator'
import { Role, Status } from 'generated/prisma/enums'
import { CursorPaginationDto } from 'src/utils/pagination'

export class ListUsersDto extends CursorPaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @IsOptional()
  @IsEnum(Status)
  status?: Status
}
