import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import axios from 'axios';
import * as crypto from 'crypto';
import { ApiResponse } from '@/common/dto/api-response.dto';

import { Cart, CartDocument } from '../carts/entities/cart.entity';
import {
  CartDetail,
  CartDetailDocument,
} from '../cart-details/entities/cart-detail.entity';
import { User, UserDocument } from '../users/entities/user.entity';

import {
  Payment,
  PaymentDocument,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment.dto';

import {
  Order,
  OrderDocument,
  OrderStatus,
} from '../orders/entities/order.entity';
import {
  OrderDetail,
  OrderDetailDocument,
} from '../order-details/entities/order-detail.entity';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/entities/enrollment.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/schemas/notification.schema';
import { Course, CourseDocument } from '../courses/entities/course.entity';
import { Role, RoleDocument } from '../roles/entities/role.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(OrderDetail.name)
    private readonly orderDetailModel: Model<OrderDetailDocument>,

    @InjectModel(CartDetail.name)
    private readonly cartDetailModel: Model<CartDetailDocument>,

    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,

    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,

    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly notificationService: NotificationService,
  ) {}

  private async getCartWithItems(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    const userObjectId = new Types.ObjectId(userId);

    const cart = await this.cartModel.findOne({
      user_id: userObjectId,
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const cartDetails = await this.cartDetailModel
      .find({ cart_id: cart._id })
      .populate('course_id')
      .lean();

    if (!cartDetails.length) {
      throw new BadRequestException('Giỏ hàng không có sản phẩm');
    }

    const amount = cartDetails.reduce((sum, item) => sum + item.price, 0);

    return { cart, cartDetails, amount };
  }

  async createPayment(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<ApiResponse<any>> {
    const { payment_method, courseId } = createPaymentDto;

    const userObjectId = new Types.ObjectId(userId);
    const user = await this.userModel.findById(userObjectId).lean();

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (!user.phone) {
      throw new BadRequestException(
        'Vui lòng cập nhật số điện thoại trước khi thanh toán',
      );
    }

    // const { cart, cartDetails, amount } = await this.getCartWithItems(userId);

    let cart, cartDetails, amount;

    if (courseId) {
      // 👉 BUY NOW
      ({ cart, cartDetails, amount } = await this.getSingleCourse(courseId));
    } else {
      // 👉 CART
      ({ cart, cartDetails, amount } = await this.getCartWithItems(userId));
    }

    const order = await this.orderModel.create({
      user_id: userObjectId,
      total_price: amount,
      status: OrderStatus.PENDING,
    });

    const orderDetailsPayload = cartDetails.map((item: any) => ({
      order_id: order._id,
      course_id: item.course_id?._id
        ? new Types.ObjectId(item.course_id._id)
        : new Types.ObjectId(item.course_id),
      price: item.price,
    }));

    const orderDetails =
      await this.orderDetailModel.insertMany(orderDetailsPayload);

    if (payment_method === PaymentMethod.COD) {
      const payment = await this.paymentModel.create({
        user_id: userObjectId,
        order_id: order._id,
        amount,
        payment_method: PaymentMethod.COD,
        payment_status: PaymentStatus.PENDING,
        paid_at: null,
      });

      if (!courseId && cart) {
        await this.cartDetailModel.deleteMany({ cart_id: cart._id });
      }

      if (courseId) {
        const userCart = await this.cartModel.findOne({
          user_id: userObjectId,
        });

        if (userCart) {
          await this.cartDetailModel.deleteOne({
            cart_id: userCart._id,
            course_id: new Types.ObjectId(courseId),
          });
        }
      }

      await this.sendPaymentSuccessEmail(
        userObjectId.toString(),
        payment._id.toString(),
        order._id.toString(),
      );
      await this.notifyAdminsNewOrder(order._id.toString(), userObjectId.toString());

      return new ApiResponse('Tạo đơn hàng và thanh toán COD thành công', {
        order,
        orderDetails,
        payment,
        totalPrice: amount,
      });
    }

    if (payment_method === PaymentMethod.VNPAY) {
      const payment = await this.paymentModel.create({
        user_id: userObjectId,
        order_id: order._id,
        amount,
        payment_method: PaymentMethod.VNPAY,
        payment_status: PaymentStatus.PENDING,
        paid_at: null,
      });

      const vnpay = new VNPay({
        tmnCode: this.configService.get<string>('VNPAY_TMN_CODE')!,
        secureSecret: this.configService.get<string>('VNPAY_HASH_SECRET')!,
        vnpayHost: this.configService.get<string>('VNPAY_URL')!,
        testMode: true,
        hashAlgorithm: 'SHA512' as any,
        loggerFn: ignoreLogger,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: `${order._id}_${Date.now()}`,
        vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: this.configService.get<string>('VNPAY_RETURN_URL')!,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow),
      });

      return new ApiResponse('Tạo đơn hàng và thanh toán VNPAY thành công', {
        order,
        orderDetails,
        payment,
        payment_url: paymentUrl,
        totalPrice: amount,
      });
    }

    if (payment_method === PaymentMethod.MOMO) {
      const payment = await this.paymentModel.create({
        user_id: userObjectId,
        order_id: order._id,
        amount,
        payment_method: PaymentMethod.MOMO,
        payment_status: PaymentStatus.PENDING,
        paid_at: null,
      });

      const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE')!;
      const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY')!;
      const secretKey = this.configService.get<string>('MOMO_SECRET_KEY')!;
      const redirectUrl = this.configService.get<string>('MOMO_REDIRECT_URL')!;
      const ipnUrl = this.configService.get<string>('MOMO_IPN_URL')!;
      const momoEndpoint = this.configService.get<string>('MOMO_ENDPOINT')!;

      const requestId = `${order._id}_${Date.now()}`;
      const orderId = order._id.toString();
      const orderInfo = `Thanh toán đơn hàng ${orderId}`;
      const requestType = 'payWithMethod';
      const extraData = '';
      const autoCapture = true;
      const lang = 'vi';

      const rawSignature =
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&ipnUrl=${ipnUrl}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${partnerCode}` +
        `&redirectUrl=${redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`;

      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

      const requestBody = {
        partnerCode,
        partnerName: 'CodeMaster AI',
        storeId: 'CodeMasterAIStore',
        requestId,
        amount: amount.toString(),
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        signature,
      };

      const momoResponse = await axios.post(momoEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return new ApiResponse('Tạo đơn hàng và thanh toán MOMO thành công', {
        order,
        orderDetails,
        payment,
        payment_url: momoResponse.data.payUrl,
        qrCodeUrl: momoResponse.data.qrCodeUrl,
        deeplink: momoResponse.data.deeplink,
        totalPrice: amount,
      });
    }

    throw new BadRequestException('Phương thức thanh toán không hợp lệ');
  }

  async getMyPayments(userId: string): Promise<ApiResponse<Payment[]>> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    const payments = await this.paymentModel
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('order_id')
      .lean();

    return new ApiResponse('Lấy danh sách thanh toán thành công', payments);
  }

  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('id không hợp lệ');
    }

    const payment = await this.paymentModel
      .findById(id)
      .populate('user_id')
      .populate('order_id')
      .lean();

    if (!payment) {
      throw new NotFoundException('Thanh toán không tồn tại');
    }

    return new ApiResponse('Lấy chi tiết thanh toán thành công', payment);
  }

  async updatePaymentStatus(
    id: string,
    updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<ApiResponse<Payment>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('id không hợp lệ');
    }

    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException('Thanh toán không tồn tại');
    }

    payment.payment_status = updatePaymentStatusDto.payment_status;

    if (updatePaymentStatusDto.payment_status === PaymentStatus.PAID) {
      payment.paid_at = new Date();

      if (payment.order_id) {
        await this.orderModel.findByIdAndUpdate(payment.order_id, {
          status: OrderStatus.PAID,
        });

        await this.createEnrollmentFromOrder(payment.order_id);
      }
    }

    await payment.save();

    return new ApiResponse(
      'Cập nhật trạng thái thanh toán thành công',
      payment,
    );
  }

  private async createEnrollmentFromOrder(orderId: string | Types.ObjectId) {
    const orderObjectId =
      typeof orderId === 'string' ? new Types.ObjectId(orderId) : orderId;

    const order = await this.orderModel.findById(orderObjectId).lean();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng để tạo enrollment');
    }

    const orderDetails = await this.orderDetailModel
      .find({ order_id: orderObjectId })
      .lean();

    if (!orderDetails.length) {
      throw new BadRequestException('Đơn hàng không có khóa học nào');
    }

    const enrollmentsToCreate: {
      user_id: Types.ObjectId;
      course_id: Types.ObjectId;
      status: string;
    }[] = [];

    for (const item of orderDetails) {
      const existedEnrollment = await this.enrollmentModel.findOne({
        user_id: order.user_id,
        course_id: item.course_id,
      });

      if (!existedEnrollment) {
        enrollmentsToCreate.push({
          user_id: order.user_id as Types.ObjectId,
          course_id: item.course_id as Types.ObjectId,
          status: 'active',
        });
      }
    }

    if (enrollmentsToCreate.length) {
      await this.enrollmentModel.insertMany(enrollmentsToCreate);
    }

    return enrollmentsToCreate;
  }

  async confirmPaymentSuccessByOrder(
    orderId: string,
    paymentMethod: PaymentMethod,
  ) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('orderId không hợp lệ');
    }

    const orderObjectId = new Types.ObjectId(orderId);

    const order = await this.orderModel.findById(orderObjectId);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const payment = await this.paymentModel.findOne({
      order_id: orderObjectId,
      payment_method: paymentMethod,
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy payment để cập nhật');
    }

    if (payment.payment_status === PaymentStatus.PAID) {
      return { payment, order };
    }

    payment.payment_status = PaymentStatus.PAID;
    payment.paid_at = new Date();
    await payment.save();

    await this.orderModel.findByIdAndUpdate(orderObjectId, {
      status: OrderStatus.PAID,
    });

    await this.createEnrollmentFromOrder(orderObjectId);

    const cart = await this.cartModel.findOne({ user_id: order.user_id });
    if (cart) {
      await this.cartDetailModel.deleteMany({ cart_id: cart._id });
    }

    await this.sendPaymentSuccessEmail(
      order.user_id.toString(),
      payment._id.toString(),
      order._id.toString(),
    );
    // Gửi notification sau khi thanh toán thành công
    await this.sendPaymentSuccessNotification(
      order.user_id.toString(),
      order._id.toString(),
    );

    return { payment, order };
  }

  private async getSingleCourse(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('courseId không hợp lệ');
    }

    const course = await this.courseModel.findById(courseId).lean();

    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }

    return {
      cart: null,
      cartDetails: [
        {
          course_id: course._id,
          price: course.price,
        },
      ],
      amount: course.price,
    };
  }

  async markPaymentPaidAndClearCartByOrder(orderId: string) {
    return this.confirmPaymentSuccessByOrder(orderId, PaymentMethod.VNPAY);
  }
  async handleMomoIpn(payload: any) {
    const { orderId, resultCode, message } = payload;

    console.log('MOMO IPN payload:', payload);

    if (Number(resultCode) !== 0) {
      throw new BadRequestException(
        `Thanh toán MoMo thất bại: ${message || 'Unknown error'}`,
      );
    }

    return this.confirmPaymentSuccessByOrder(orderId, PaymentMethod.MOMO);
  }
  // Gửi notification sau khi thanh toán thành công
  private async sendPaymentSuccessNotification(userId: string, orderId: string) {
    const courseText = await this.buildCourseTextFromOrder(orderId);

    try {
      await this.notificationService.create({
        userId,
        title: 'Thanh toán thành công',
        message: `Bạn đã mua thành công ${courseText}. Chúc bạn học tập hiệu quả!`,
        type: NotificationType.COURSE,
        link: orderId,
      });

      // Gửi notification cho admin
      await this.sendNotificationToAdmins(courseText, userId);
    } catch (error) {
      console.error('Send payment notification failed:', error);
    }
  }

  private async buildCourseTextFromOrder(orderId: string) {
    const orderDetails = await this.orderDetailModel
      .find({ order_id: new Types.ObjectId(orderId) })
      .populate('course_id', 'title')
      .lean();

    const courseNames = orderDetails
      .map((item: any) => item.course_id?.title)
      .filter(Boolean);
    const topNames = courseNames.slice(0, 2).join(', ');
    const suffix =
      courseNames.length > 2 ? ` và ${courseNames.length - 2} khóa học khác` : '';
    return topNames ? `${topNames}${suffix}` : 'khóa học';
  }

  private async notifyAdminsNewOrder(orderId: string, userId: string) {
    const courseText = await this.buildCourseTextFromOrder(orderId);
    await this.sendNotificationToAdmins(courseText, userId);
  }

  // Gửi notification cho tất cả admin khi có đơn hàng mới
  private async sendNotificationToAdmins(courseText: string, userId: string) {
    try {
      const adminRoles = await this.roleModel
        .find({ role_name: { $regex: /admin/i } })
        .lean();
      if (!adminRoles?.length) {
        console.warn('Admin roles not found');
        return;
      }

      const roleIds = adminRoles.map((role) => role._id);
      const adminUsers = await this.userModel
        .find({ role_id: { $in: roleIds } })
        .lean();

      if (!adminUsers?.length) {
        console.warn('No admin users found for admin roles');
        return;
      }

      const user = await this.userModel.findById(userId).lean();
      const userName = user?.name || user?.email || 'Người dùng';

      for (const admin of adminUsers) {
        await this.notificationService.create({
          userId: admin._id.toString(),
          title: 'Đơn hàng mới',
          message: `${userName} đã mua thành công ${courseText}.`,
          type: NotificationType.ORDER,
          link: '/admin/orders',
        });
      }
    } catch (error) {
      console.error('Send notification to admins failed:', error);
    }
  }

  private async sendPaymentSuccessEmail(
    userId: string,
    invoiceCode: string,
    orderCode: string,
  ) {
    const user = await this.userModel.findById(userId).lean();

    if (!user || !user.email) {
      throw new BadRequestException('Người dùng không có email');
    }

    const orderDetails = await this.orderDetailModel
      .find({ order_id: new Types.ObjectId(orderCode) })
      .populate('course_id')
      .lean();

    const courseName = orderDetails
      .map((item: any) => item.course_id?.title)
      .filter(Boolean)
      .join(', ');

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Xác nhận thanh toán đơn hàng CodeMaster AI',
      template: 'payment-success',
      context: {
        name: user.name || user.email,
        invoiceCode,
        orderCode,
        paymentDate: new Date().toLocaleString('vi-VN'),
        courseName: courseName || 'Khóa học tại CodeMaster AI',
        phoneNumber: user.phone || 'Chưa cập nhật',
      },
    });
  }

  async getPaymentByOrderId(orderId: string): Promise<ApiResponse<Payment>> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('orderId không hợp lệ');
    }

    const payment = await this.paymentModel
      .findOne({ order_id: new Types.ObjectId(orderId) })
      .populate('user_id')
      .populate('order_id')
      .lean();

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán cho đơn hàng này');
    }

    return new ApiResponse(
      'Lấy thông tin thanh toán theo đơn hàng thành công',
      payment,
    );
  }
}
