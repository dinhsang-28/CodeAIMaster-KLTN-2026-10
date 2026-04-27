import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { UserLessonProgressService } from './user-lesson-progress.service';
import { UpdateVideoProgressDto } from './dto/update-video-progress.dto';

@Controller('user-lesson-progress')
@UseGuards(JwtAuthGuard)
export class UserLessonProgressController {
  constructor(
    private readonly userLessonProgressService: UserLessonProgressService,
  ) {}

  @Post('open/:lessonId')
  openLesson(
    @Req() req,
    @Param('lessonId', ParseObjectIdPipe) lessonId: string,
  ) {
    const userId = req.user._id;
    return this.userLessonProgressService.openLesson(userId, lessonId);
  }

  @Patch('video')
  updateVideoProgress(@Req() req, @Body() body: UpdateVideoProgressDto) {
    const userId = req.user._id;
    return this.userLessonProgressService.updateVideoProgress(
      userId,
      body.lessonId,
      body.watchPercent,
    );
  }
}
