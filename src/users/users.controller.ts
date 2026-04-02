import { Controller, Get, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { ListUsersDto } from './dtos/list-users.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  @Auth({ roles: ['admin'] })
  async httpListUsers(@Query() query: ListUsersDto, @AuthUser() user: User): HttpResponse {
    const result = await this.usersService.list(query, user)
    return { success: true, message: 'Listed users successfully.', data: result }
  }
}
