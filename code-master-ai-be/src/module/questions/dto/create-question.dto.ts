import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsMongoId()
  quiz_id!: string;

  @IsString()
  @IsNotEmpty()
  question_text!: string;

  @IsOptional()
  @IsString()
  option_a?: string;

  @IsOptional()
  @IsString()
  option_b?: string;

  @IsOptional()
  @IsString()
  option_c?: string;

  @IsOptional()
  @IsString()
  option_d?: string;

  @IsString()
  @IsNotEmpty()
  correct_answer!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  score?: number;
}
