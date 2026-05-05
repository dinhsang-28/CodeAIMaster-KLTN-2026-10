import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

import { Payment, PaymentSchema } from './entities/payment.entity';
import { Cart, CartSchema } from '../carts/entities/cart.entity';
import {
  CartDetail,
  CartDetailSchema,
} from '../cart-details/entities/cart-detail.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Order, OrderSchema } from '../orders/entities/order.entity';
import {
  OrderDetail,
  OrderDetailSchema,
} from '../order-details/entities/order-detail.entity';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/entities/enrollment.entity';
import { NotificationModule } from '../notification/notification.module';
import { Course, CourseSchema } from '../courses/entities/course.entity';

@Module({
  imports: [
    NotificationModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: OrderDetail.name, schema: OrderDetailSchema },
      { name: CartDetail.name, schema: CartDetailSchema },
      { name: User.name, schema: UserSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
