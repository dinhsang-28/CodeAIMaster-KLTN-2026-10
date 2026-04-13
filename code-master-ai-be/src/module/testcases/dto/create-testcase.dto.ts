import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTestcaseDto {
  @IsMongoId()
  code_assignment_id!: string;

  @IsString()
  @IsNotEmpty()
  input_data!: string;

  @IsString()
  @IsNotEmpty()
  expected_output!: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_hidden?: boolean;
}
