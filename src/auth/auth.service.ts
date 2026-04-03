import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { RegisterDto } from './dtos/register.dto'
import { UNIQUE_ERR_CODE } from '../utils/constants'
import { InvalidCredentialsError, UnqiueUsernameError } from './auth.errors'
import { JwtService } from '@nestjs/jwt'
import { compareSync, hashSync } from 'bcrypt'
import { LoginDto } from './dtos/login.dto'
import { ConfigService } from '@nestjs/config'
import { Role, Status } from 'generated/prisma/enums'

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const user = await this.db.user
      .create({ data: { username: data.username, password: hashSync(data.password, 10) } })
      .catch(err => {
        if (err.code === UNIQUE_ERR_CODE) throw new UnqiueUsernameError()
        throw err
      })

    const tokens = await this.generateTokens(user.id, user.role)
    await this.updateRefreshToken(user.id, tokens.refresh)

    return tokens
  }

  async login(data: LoginDto) {
    const registered = await this.db.user.findUnique({
      where: { username: data.username, status: Status.active },
      select: { id: true, password: true, role: true },
    })

    if (!registered) throw new InvalidCredentialsError()

    const match = compareSync(data.password, registered.password)
    if (!match) throw new InvalidCredentialsError()

    const tokens = await this.generateTokens(registered.id, registered.role)
    await this.updateRefreshToken(registered.id, tokens.refresh)

    return tokens
  }

  async refresh(token: string, userId: string) {
    const user = await this.db.user.findUnique({ where: { id: userId }, select: { role: true, refresh: true } })
    if (!user || !user.refresh) throw new InvalidCredentialsError()

    const match = compareSync(token, user.refresh)
    if (!match) throw new InvalidCredentialsError()

    const tokens = await this.generateTokens(userId, user.role)
    await this.updateRefreshToken(userId, tokens.refresh)

    return tokens
  }

  async logout(userId: string) {
    await this.db.user.updateMany({ where: { id: userId, refresh: { not: null } }, data: { refresh: null } })
  }

  private async generateTokens(userId: string, role: Role) {
    const payload = { id: userId, role }

    const [access, refresh] = await Promise.all([
      this.jwt.signAsync(payload, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: '15m' }),
      this.jwt.signAsync(payload, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: '7d' }),
    ])

    return { access, refresh }
  }

  private async updateRefreshToken(userId: string, refresh: string) {
    await this.db.user.update({ where: { id: userId }, data: { refresh: hashSync(refresh, 10) } })
  }
}
