import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SearchAssignmentDto } from './dto/search-assigment.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/passport/permissions.guard';
import { RequirePermissions } from '@/auth/decorators/permisions.decorator';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('exercises_create')
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('exercises_view')
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get('search')
  searchAssignment(@Query() search: SearchAssignmentDto) {
    return this.assignmentsService.searchAssignments(search);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('exercises_view')
  async exportAssignments(
    @Query() search: SearchAssignmentDto,
    @Res() res: Response,
  ) {
    const buffer = await this.assignmentsService.exportAssignments(search);
    const fileName = `assignments-${Date.now()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }
   @UseGuards(JwtAuthGuard,PermissionsGuard)
   @RequirePermissions('exercises_edit')  
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('exercises_delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}
