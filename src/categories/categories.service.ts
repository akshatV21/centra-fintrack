import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateCategoryDto } from './dtos/create-category.dto'
import { CursorPaginationDto } from 'src/utils/pagination'
import { UpdateCategoryDto } from './dtos/update-category.dto'
import { ERR_CODES } from 'src/utils/constants'
import { CategoryNotFoundError } from './categories.errors'

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateCategoryDto) {
    const category = await this.db.category.create({ data })
    return category
  }

  async list(pagination: CursorPaginationDto) {
    const limit = pagination.limit ?? 10

    const categories = await this.db.category.findMany({
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
      take: limit + 1,
      orderBy: { createdAt: 'asc' },
    })

    let cursor: string | null = null

    if (categories.length > limit) {
      const next = categories.pop()!
      cursor = next.id
    }

    return { categories, cursor }
  }

  async update(data: UpdateCategoryDto) {
    const category = await this.db.category
      .update({ where: { id: data.categoryId }, data: { name: data.name } })
      .catch(err => {
        if (err.code === ERR_CODES.NOT_FOUND) throw new CategoryNotFoundError()
        throw err
      })

    return category
  }

  async delete(categoryId: string) {
    await this.db.category.delete({ where: { id: categoryId } }).catch(err => {
      if (err.code === ERR_CODES.NOT_FOUND) throw new CategoryNotFoundError()
      throw err
    })
  }
}
