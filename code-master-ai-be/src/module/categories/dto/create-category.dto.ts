import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  category_name;

  @IsOptional()
  @IsString()
  description?: string;
}
