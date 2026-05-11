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
} from '@nestjs/common';
import { TestcasesService } from './testcases.service';
import { CreateTestcaseDto } from './dto/create-testcase.dto';
import { UpdateTestcaseDto } from './dto/update-testcase.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/passport/permissions.guard';
import { RequirePermissions } from '@/auth/decorators/permisions.decorator';

@Controller('testcases')
export class TestcasesController {
  constructor(private readonly testcasesService: TestcasesService) {}
  @UseGuards(JwtAuthGuard,PermissionsGuard) 
  @RequirePermissions('testcases_create')
  @Post('generate-ai/:assignmentId')
  async generateAI(
    @Param('assignmentId') assignmentId: string,
    @Body('solutionCode') solutionCode: string,
    @Body('constraints') constraints: string,
    @Body('numberOfTestCases') numberOfTestCases: number,
    @Body('hiddenTestCases') hiddenTestCases?: number,
  ) {
    return this.testcasesService.generateTestCaseByAI(
      assignmentId,
      solutionCode,
      constraints,
      numberOfTestCases,
      hiddenTestCases,
    );
  }
  @UseGuards(JwtAuthGuard,PermissionsGuard) 
  @RequirePermissions('testcases_create')
  @Post()
  create(@Body() createTestcaseDto: CreateTestcaseDto) {
    return this.testcasesService.create(createTestcaseDto);
  }
 @UseGuards(JwtAuthGuard,PermissionsGuard) 
  @RequirePermissions('testcases_create')
  @Post('create')
  createAlias(@Body() createTestcaseDto: CreateTestcaseDto) {
    return this.testcasesService.create(createTestcaseDto);
  }

  @Get()
  findAll(@Query('code_assignment_id') codeAssignmentId?: string) {
    return this.testcasesService.findAll(codeAssignmentId);
  }

  @Get('public')
  getPublicTestCases(@Query('code_assignment_id') codeAssignmentId: string) {
    return this.testcasesService.getPublicTestCases(codeAssignmentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.testcasesService.findOne(id);
  }
  @UseGuards(JwtAuthGuard,PermissionsGuard) 
  @RequirePermissions('testcases_edit')
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTestcaseDto: UpdateTestcaseDto,
  ) {
    return this.testcasesService.update(id, updateTestcaseDto);
  }
  @UseGuards(JwtAuthGuard,PermissionsGuard) 
  @RequirePermissions('testcases_delete')
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.testcasesService.remove(id);
  }
}
