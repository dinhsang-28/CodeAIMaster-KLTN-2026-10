import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CodeAssignmentsService } from './code-assignments.service';
import { CreateCodeAssignmentDto } from './dto/create-code-assignment.dto';
import { UpdateCodeAssignmentDto } from './dto/update-code-assignment.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/passport/permissions.guard';
import { RequirePermissions } from '@/auth/decorators/permisions.decorator';

@Controller('code-assignments')
@UseGuards(JwtAuthGuard)
export class CodeAssignmentsController {
  constructor(
    private readonly codeAssignmentsService: CodeAssignmentsService,
  ) {}
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('assignments_create')
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
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('assignments_edit')
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCodeAssignmentDto: UpdateCodeAssignmentDto,
  ) {
    return this.codeAssignmentsService.update(id, updateCodeAssignmentDto);
  }
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('assignments_delete')
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.codeAssignmentsService.remove(id);
  }
}