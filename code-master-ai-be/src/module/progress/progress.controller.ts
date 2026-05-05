import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Lấy tiến độ học tập của người dùng cho một khóa học cụ thể
  @Get('course/:courseId')
  getCourseProgress(
    @Req() req,
    @Param('courseId', ParseObjectIdPipe) courseId: string,
  ) {
    return this.progressService.getCourseProgress(req.user._id, courseId);
  }
}
