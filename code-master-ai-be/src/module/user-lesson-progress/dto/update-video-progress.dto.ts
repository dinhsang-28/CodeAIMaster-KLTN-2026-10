import { IsMongoId, IsNumber, Max, Min } from 'class-validator';

export class UpdateVideoProgressDto {
  @IsMongoId()
  lessonId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  watchPercent!: number;
}
