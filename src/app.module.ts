import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, JwtModule.register({ global: true }), AuthModule, CategoriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
