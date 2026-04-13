import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeAssignmentDto } from './create-code-assignment.dto';

export class UpdateCodeAssignmentDto extends PartialType(
  CreateCodeAssignmentDto,
) {}
