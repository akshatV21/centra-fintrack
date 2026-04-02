import { BadRequestException } from '@nestjs/common'

export class PaymentNotFoundError extends BadRequestException {
  constructor() {
    super({ error: 'PaymentNotFoundError' })
  }
}

export class InvalidCategoryError extends BadRequestException {
  constructor() {
    super({ error: 'InvalidCategoryError' })
  }
}
