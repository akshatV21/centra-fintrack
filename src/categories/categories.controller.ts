import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateCategoryDto } from './dtos/create-category.dto'
import { HttpResponse } from 'src/utils/types'
import { CursorPaginationDto } from 'src/utils/pagination'
import { UpdateCategoryDto } from './dtos/update-category.dto'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  @Auth({ roles: ['admin'] })
  async httpCreateCategory(@Body() data: CreateCategoryDto): HttpResponse {
    const category = await this.categoriesService.create(data)
    return { success: true, message: 'Category created successfully.', data: category }
  }

  @Get('list')
  @Auth({ roles: ['analyst', 'admin'] })
  async httpListCategories(@Query() query: CursorPaginationDto): HttpResponse {
    const result = await this.categoriesService.list(query)
    return { success: true, message: 'Categories listed successfully.', data: result }
  }

  @Patch('update')
  @Auth({ roles: ['admin'] })
  async httpUpdateCategory(@Body() data: UpdateCategoryDto): HttpResponse {
    const category = await this.categoriesService.update(data)
    return { success: true, message: 'Category updated successfully.', data: category }
  }

  @Delete(':id')
  @Auth({ roles: ['admin'] })
  async httpDeleteCategory(@Param('id') categoryId: string): HttpResponse {
    await this.categoriesService.delete(categoryId)
    return { success: true, message: 'Category deleted successfully.' }
  }
}
