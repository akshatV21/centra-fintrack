import { BadRequestException } from '@nestjs/common'

export class CategoryNotFoundError extends BadRequestException {
  constructor() {
    super({ error: 'CategoryNotFoundError' })
  }
}
