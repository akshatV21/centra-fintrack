import { BadRequestException } from '@nestjs/common'

export class UnqiueUsernameError extends BadRequestException {
  constructor() {
    super({ error: 'UniqueUsernameError' })
  }
}

export class InvalidCredentialsError extends BadRequestException {
  constructor() {
    super({ error: 'InvalidCredentialsError' })
  }
}

import { UnauthorizedException } from '@nestjs/common'

export class NoAuthHeaderError extends UnauthorizedException {
  constructor() {
    super({ success: false, error: 'NoAuthHeader' })
  }
}

export class NoRefreshTokenError extends UnauthorizedException {
  constructor() {
    super({ success: false, error: 'NoRefreshToken' })
  }
}

export class TokenExpiredError extends UnauthorizedException {
  constructor() {
    super({ success: false, error: 'TokenExpired' })
  }
}

export class InvalidTokenError extends UnauthorizedException {
  constructor() {
    super({ success: false, error: 'InvalidToken' })
  }
}
