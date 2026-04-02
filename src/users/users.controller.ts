import { Body, Controller, Get, Patch, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { ListUsersDto } from './dtos/list-users.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'
import { UpdateUserStatusDto } from './dtos/update-status.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  @Auth({ roles: ['admin'] })
  async httpListUsers(@Query() query: ListUsersDto, @AuthUser() user: User): HttpResponse {
    const result = await this.usersService.list(query, user)
    return { success: true, message: 'Listed users successfully.', data: result }
  }

  @Patch('status')
  @Auth({ roles: ['admin'] })
  async httpUpdateStatus(@Body() data: UpdateUserStatusDto): HttpResponse {
    await this.usersService.status(data)
    return { success: true, message: 'User status updated successfully.' }
  }
}
