import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdvisoryDocument = HydratedDocument<Advisory>;

@Schema({ timestamps: true })
export class Advisory {
  @Prop({ required: true })
  contact_info!: string; // Lưu SĐT hoặc Email khách để lại
  @Prop({ default: false })
  is_returning!: boolean; // Đánh dấu khách cũ quay lại

  @Prop({ default: 'NEW', enum: ['NEW', 'CONTACTED', 'RESOLVED'] })
  status!: string; // Trạng thái: Mới, Đã gọi, Đã chốt xong

  @Prop()
  chat_history!: string; // Lưu ngữ cảnh để Admin biết khách đang hỏi gì
}

export const AdvisorySchema = SchemaFactory.createForClass(Advisory);