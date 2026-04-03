import { BadRequestException } from '@nestjs/common'

export class CategoryNotFoundError extends BadRequestException {
  constructor() {
    super({ error: 'CategoryNotFoundError' })
  }
}

export class CannotDeleteCategoryError extends BadRequestException {
  constructor() {
    super({ error: 'CannotDeleteCategoryError', message: 'Cannot delete Categories with payments associated with it.' })
  }
}
