import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizDto {
  @IsMongoId()
  assignment_id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  time_limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_score?: number;
}
