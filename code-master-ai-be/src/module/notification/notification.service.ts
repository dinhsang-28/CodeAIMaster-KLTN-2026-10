import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,

    private readonly notificationGateway: NotificationGateway,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is not a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async create(dto: CreateNotificationDto) {
    const notification = await this.notificationModel.create({
      userId: this.toObjectId(dto.userId, 'userId'),
      title: dto.title,
      message: dto.message,
      type: dto.type,
      link: dto.link,
      isRead: false,
    });

    const unreadCount = await this.countUnread(dto.userId);

    this.notificationGateway.sendToUser(dto.userId, notification);
    this.notificationGateway.updateUnreadCount(dto.userId, unreadCount);

    return notification;
  }

  async findByUser(userId: string) {
    return this.notificationModel
      .find({ userId: this.toObjectId(userId, 'userId') })
      .sort({ createdAt: -1 })
      .limit(20);
  }

  async countUnread(userId: string) {
    return this.notificationModel.countDocuments({
      userId: this.toObjectId(userId, 'userId'),
      isRead: false,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      {
        _id: this.toObjectId(notificationId, 'notificationId'),
        userId: this.toObjectId(userId, 'userId'),
      },
      { isRead: true },
      { new: true },
    );

    const unreadCount = await this.countUnread(userId);
    this.notificationGateway.updateUnreadCount(userId, unreadCount);

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId: this.toObjectId(userId, 'userId'), isRead: false },
      { isRead: true },
    );

    this.notificationGateway.updateUnreadCount(userId, 0);

    return {
      message: 'Marked all notifications as read',
    };
  }

  async remove(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOneAndDelete({
      _id: this.toObjectId(notificationId, 'notificationId'),
      userId: this.toObjectId(userId, 'userId'),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const unreadCount = await this.countUnread(userId);
    this.notificationGateway.updateUnreadCount(userId, unreadCount);

    return {
      message: 'Deleted notification successfully',
    };
  }
}
