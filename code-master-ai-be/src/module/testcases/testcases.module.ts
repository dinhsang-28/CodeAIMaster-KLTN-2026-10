import { Module } from '@nestjs/common';
import { TestcasesService } from './testcases.service';
import { TestcasesController } from './testcases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CodeAssignment,
  CodeAssignmentSchema,
} from '../code-assignments/entities/code-assignment.entity';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/entities/assignment.entity';
import { TestCase, TestCaseSchema } from './entities/testcase.entity';
import { AiAssistantService } from '@/ai-assistant/ai-assistant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CodeAssignment.name, schema: CodeAssignmentSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: TestCase.name, schema: TestCaseSchema },
    ]),
  ],
  controllers: [TestcasesController],
  providers: [TestcasesService, AiAssistantService],
})
export class TestcasesModule {}
