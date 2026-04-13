import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CodeAssignmentsService } from './code-assignments.service';
import { CreateCodeAssignmentDto } from './dto/create-code-assignment.dto';
import { UpdateCodeAssignmentDto } from './dto/update-code-assignment.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

@Controller('code-assignments')
export class CodeAssignmentsController {
  constructor(
    private readonly codeAssignmentsService: CodeAssignmentsService,
  ) {}

  @Post()
  create(@Body() createCodeAssignmentDto: CreateCodeAssignmentDto) {
    return this.codeAssignmentsService.create(createCodeAssignmentDto);
  }

  @Get()
  findAll(@Query('assignment_id') assignmentId?: string) {
    return this.codeAssignmentsService.findAll(assignmentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.codeAssignmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCodeAssignmentDto: UpdateCodeAssignmentDto,
  ) {
    return this.codeAssignmentsService.update(id, updateCodeAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.codeAssignmentsService.remove(id);
  }
}
