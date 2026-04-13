import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { CourseLevel } from '../enums/courseLevel.enum';

export class SearchCourse {
  @IsOptional()
  keyword?: string;

  @IsOptional()
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsOptional()
  category: string;

  @IsOptional()
  @IsNumberString() // chỉ nhận giá trị số
  minPrice: string;

  @IsOptional() //cho phép nhận giá trị unified không báo lỗi
  @IsNumberString()
  maxPrice: string;

  @IsOptional()
  @IsNumberString()
  page: string;

  @IsOptional()
  @IsNumberString()
  limit: string;
}
