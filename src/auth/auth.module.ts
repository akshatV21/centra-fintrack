import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { APP_GUARD } from '@nestjs/core'
import { Authorize } from './guards/authorize.guard'

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: Authorize }],
})
export class AuthModule {}
