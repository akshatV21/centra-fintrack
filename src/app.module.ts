import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, JwtModule.register({ global: true })],
  controllers: [],
  providers: [],
})
export class AppModule {}
