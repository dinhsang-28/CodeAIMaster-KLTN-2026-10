import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDetailDocument = HydratedDocument<CartDetail>;

@Schema({ timestamps: true })
export class CartDetail {
  @Prop({ type: Types.ObjectId, ref: 'Cart', required: true })
  cart_id!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id!: Types.ObjectId;
  @Prop({ required: true }) price!: number;
}
export const CartDetailSchema = SchemaFactory.createForClass(CartDetail);
