import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import * as morgan from 'morgan'
import * as cookieParser from 'cookie-parser'
import { ConsoleLogger, Logger } from '@nestjs/common'
import { CustomValidationPipe } from './utils/pipe'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new ConsoleLogger({ prefix: 'Centra' }) })
  const config = app.get<ConfigService>(ConfigService)

  const PORT = config.getOrThrow('PORT')
  const logger = new Logger('Bootstrap')

  app.use(helmet())
  app.use(morgan('dev'))
  app.use(cookieParser())

  app.setGlobalPrefix('api')
  app.useGlobalPipes(new CustomValidationPipe())

  await app.listen(PORT, () => logger.log(`Listening to requests on port: ${PORT}`))
}

bootstrap()
