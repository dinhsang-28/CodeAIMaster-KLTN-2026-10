import { IsString, IsNotEmpty, IsNumber, IsMongoId, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  thumbnail: string;

  @IsMongoId()
  category: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learning_outcomes: string[];

  // ✅ Yêu cầu đầu vào
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements: string[];
}
