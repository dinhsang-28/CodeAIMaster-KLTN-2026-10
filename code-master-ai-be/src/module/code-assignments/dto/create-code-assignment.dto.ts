import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCodeAssignmentDto {
  @IsMongoId()
  assignment_id!: string;

  @IsString()
  @IsNotEmpty()
  problem_description!: string;

  @IsOptional()
  @IsString()
  input_format?: string;

  @IsOptional()
  @IsString()
  output_format?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  time_limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  memory_limit?: number;

  @IsOptional()
  @IsString()
  starter_code?: string;

  @IsOptional()
  @IsString()
  language_support?: string;
}
