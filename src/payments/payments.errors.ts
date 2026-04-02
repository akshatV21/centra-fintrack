import { BadRequestException } from '@nestjs/common'

export class InvalidCategoryError extends BadRequestException {
  constructor() {
    super({ error: 'InvalidCategoryError' })
  }
}
