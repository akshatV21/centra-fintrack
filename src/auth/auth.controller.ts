import { Body, Controller, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dtos/register.dto'
import { HttpResponse, User } from '../utils/types'
import { Response } from 'express'
import { Auth } from './decorators/auth.decorator'
import { AuthRefresh } from './decorators/auth-token.decorator'
import { AuthUser } from './decorators/auth-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth({ isOpen: true })
  async httpRegister(@Body() data: RegisterDto, @Res({ passthrough: true }) res: Response): HttpResponse {
    const tokens = await this.authService.register(data)
    this.setRefreshToken(res, tokens.refresh)

    return { success: true, data: { access: tokens.access } }
  }

  @Post('login')
  @Auth({ isOpen: true })
  async httpLogin(@Body() data: RegisterDto, @Res({ passthrough: true }) res: Response): HttpResponse {
    const tokens = await this.authService.login(data)
    this.setRefreshToken(res, tokens.refresh)

    return { success: true, data: { access: tokens.access } }
  }

  @Post('refresh')
  @Auth({ refresh: true })
  async httpRefresh(
    @AuthRefresh() refresh: string,
    @AuthUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): HttpResponse {
    const tokens = await this.authService.refresh(refresh, user.id)
    this.setRefreshToken(res, tokens.refresh)

    return { success: true, data: { access: tokens.access } }
  }

  @Post('logout')
  @Auth()
  async httpLogout(@AuthUser() user: User, @Res({ passthrough: true }) res: Response): HttpResponse {
    await this.authService.logout(user.id)
    res.clearCookie('refresh')

    return { success: true }
  }

  private setRefreshToken(res: Response, refresh: string) {
    res.cookie('refresh', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  }
}
