import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourse } from './dto/search-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(createCourseDto);
    return this.coursesService.create(createCourseDto, file);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('search')
  searchCourse(@Query() search: SearchCourse) {
    return this.coursesService.searchCourses(search);
  }

  @Get(':id/info')
  getCourseInfo(@Param('id') id: string) {
    return this.coursesService.getCourseInfo(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.update(id, updateCourseDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
