import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuizAnswerDto {
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @IsArray()
  selected_answer: string[]; // can be empty or multiple
}

export class SubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  quiz_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
