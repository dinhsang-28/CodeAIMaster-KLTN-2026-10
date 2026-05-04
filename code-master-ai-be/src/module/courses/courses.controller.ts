import { Controller,Get, Post, Body, Patch, Param, Query, UseInterceptors, 
  UploadedFile, UseGuards, Req, Delete} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourse } from './dto/search-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

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

  @Get('featuredCourses')
  getFeaturedCourses() {
    return this.coursesService.getFeaturedCourse();
  }

  @Get('search')
  searchCourse(@Query() search: SearchCourse) {
    return this.coursesService.searchCourses(search);
  }

  @Get(':id/info')
  getCourseInfo(@Param('id') id: string) {
    return this.coursesService.getCourseInfo(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('nonActive')
  getNonActiveCourses(@CurrentUser() user: any) {
    return this.coursesService.getNonActiveCourse(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('myCourses')
  getCourseEnrollment(@CurrentUser() user: any) {
    return this.coursesService.getCourseEnrollment(user._id);
  }
  @Get(':id/learning')
  @UseGuards(JwtAuthGuard)
  getLearningCourse(@Req() req, @Param('id') id: string) {
    const userId = req.user._id;
    return this.coursesService.getLearningCourse(id, userId);
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
