import { Module } from '@nestjs/common';
import { CodeAssignmentsService } from './code-assignments.service';
import { CodeAssignmentsController } from './code-assignments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CodeAssignment,
  CodeAssignmentSchema,
} from './entities/code-assignment.entity';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/entities/assignment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CodeAssignment.name, schema: CodeAssignmentSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
  ],
  controllers: [CodeAssignmentsController],
  providers: [CodeAssignmentsService],
})
export class CodeAssignmentsModule {}
