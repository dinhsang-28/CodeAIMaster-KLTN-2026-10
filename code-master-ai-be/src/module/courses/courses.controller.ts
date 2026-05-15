import { Controller,Get, Post, Body, Patch, Param, Query, UseInterceptors, 
  UploadedFile, UseGuards, Req, Delete} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { UserLessonProgressService } from '../user-lesson-progress/user-lesson-progress.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { SubmitQuizDto } from '../submissions/dto/submit-quiz.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourse } from './dto/search-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Auth } from '@/auth/entities/auth.entity';
import { PermissionsGuard } from '@/auth/passport/permissions.guard';
import { RequirePermissions } from '@/auth/decorators/permisions.decorator';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly userLessonProgressService: UserLessonProgressService,
    private readonly submissionsService: SubmissionsService,
  ) {}
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('courses_create')
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

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  getCourseProgress(@Req() req, @Param('id') id: string) {
    const userId = req.user._id;
    return this.coursesService.getCourseProgress(id, userId);
  }

  @Patch(':courseId/lessons/:lessonId/video-progress')
  @UseGuards(JwtAuthGuard)
  updateLessonVideoProgress(
    @Req() req,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body('watchPercent') watchPercent: number,
  ) {
    return this.userLessonProgressService.markVideoProgress(
      req.user._id,
      courseId,
      lessonId,
      watchPercent,
    );
  }

  @Post(':courseId/lessons/:lessonId/quiz/submit')
  @UseGuards(JwtAuthGuard)
  submitLessonQuiz(
    @Req() req,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body('answers') answers: SubmitQuizDto['answers'],
  ) {
    return this.submissionsService.submitQuizForLesson(
      req.user._id,
      courseId,
      lessonId,
      answers,
    );
  }

  @Post(':courseId/lessons/:lessonId/assignment/submit')
  @UseGuards(JwtAuthGuard)
  submitLessonAssignment(
    @Req() req,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body('language') language: string,
    @Body('code') code: string,
  ) {
    return this.submissionsService.submitCodeForLesson(
      req.user._id,
      courseId,
      lessonId,
      language,
      code,
    );
  }

  @Get(':courseId/lessons/:lessonId/access')
  @UseGuards(JwtAuthGuard)
  getLessonAccess(
    @Req() req,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.userLessonProgressService.computeLessonAccess(
      req.user._id,
      courseId,
      lessonId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }
    @UseGuards(JwtAuthGuard,PermissionsGuard)
    @RequirePermissions('courses_edit')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.update(id, updateCourseDto, file);
  }

  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('courses_delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}