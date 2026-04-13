import {
  IsOptional,
  IsString,
  IsMongoId,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentType } from '../enums/types.enum';

export class SearchAssignmentDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsMongoId()
  lesson_id: string;

  @IsOptional()
  @IsEnum(AssignmentType)
  type: AssignmentType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}
