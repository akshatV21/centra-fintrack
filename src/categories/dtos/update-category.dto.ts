import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateCategoryDto {
  @IsNotEmpty()
  @IsString()
  categoryId: string

  @IsNotEmpty()
  @IsString()
  name: string
}
