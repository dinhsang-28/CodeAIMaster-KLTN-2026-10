import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private getUserId(req: any): string {
    return req.user?._id || req.user?.userId || req.user?.sub;
  }

  @Get()
  findMine(@Req() req) {
    return this.notificationService.findByUser(this.getUserId(req));
  }

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get('unread-count')
  countUnread(@Req() req) {
    return this.notificationService.countUnread(this.getUserId(req));
  }

  @Patch(':id/read')
  markAsRead(@Req() req, @Param('id') id: string) {
    return this.notificationService.markAsRead(this.getUserId(req), id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req) {
    return this.notificationService.markAllAsRead(this.getUserId(req));
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.notificationService.remove(this.getUserId(req), id);
  }
}
