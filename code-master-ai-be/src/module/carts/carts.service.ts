import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ApiResponse } from '@/common/dto/api-response.dto';
import { Cart, CartDocument } from './entities/cart.entity';

import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Course, CourseDocument } from '../courses/entities/course.entity';
import {
  CartDetail,
  CartDetailDocument,
} from '../cart-details/entities/cart-detail.entity';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/entities/enrollment.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,

    @InjectModel(CartDetail.name)
    private readonly cartDetailModel: Model<CartDetailDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  private async findOrCreateCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({
      user_id: new Types.ObjectId(userId),
    });

    if (!cart) {
      cart = await this.cartModel.create({
        user_id: new Types.ObjectId(userId),
      });
    }

    return cart;
  }

  // private async buildCartResponse(cartId: Types.ObjectId | string) {
  //   const cart = await this.cartModel
  //     .findById(cartId)
  //     .populate('user_id')
  //     .lean();

  //   if (!cart) {
  //     throw new NotFoundException('Giỏ hàng không tồn tại');
  //   }

  //   // const cartDetails = await this.cartDetailModel
  //   //   .find({ cart_id: cart._id })
  //   //   .populate('course_id')
  //   //   .lean();

  //   // const totalPrice = cartDetails.reduce((sum, item) => sum + item.price, 0);

  //   const cartDetails = await this.cartDetailModel
  //     .find({ cart_id: cart._id })
  //     .populate('course_id')
  //     .exec();

  //   const totalPrice = cartDetails.reduce(
  //     (sum, item: any) => sum + item.course_id.price,
  //     0,
  //   );

  //   return {
  //     ...cart,
  //     items: cartDetails,
  //     totalPrice,
  //   };
  // }

  private async buildCartResponse(cartId: Types.ObjectId | string) {
    const cart = await this.cartModel
      .findById(cartId)
      .populate('user_id')
      .lean();

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const cartDetails = await this.cartDetailModel
      .find({ cart_id: cart._id })
      .populate('course_id')
      .exec(); // ❗ không dùng lean

    let totalPrice = 0;

    for (const item of cartDetails) {
      const course: any = item.course_id;

      // 🔥 SYNC GIÁ
      if (item.price !== course.price) {
        item.price = course.price;
        await item.save();
      }

      totalPrice += item.price;
    }

    return {
      ...cart,
      items: cartDetails,
      totalPrice,
    };
  }

  async createCart(
    userId: string,
    createCartDto: CreateCartDto,
  ): Promise<ApiResponse<any>> {
    const { courseId } = createCartDto;

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('courseId không hợp lệ');
    }

    const course = await this.courseModel.findById(courseId).lean();
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }
    const existedEnrollment = await this.enrollmentModel.findOne({
      user_id: new Types.ObjectId(userId),
      course_id: new Types.ObjectId(courseId),
      status: 'active', // nếu muốn chỉ chặn khóa học đang còn hiệu lực
    });

    if (existedEnrollment) {
      throw new BadRequestException(
        'Bạn đã đăng ký khóa học này rồi, không thể thêm vào giỏ hàng',
      );
    }
    const cart = await this.findOrCreateCart(userId);

    const existingCartDetail = await this.cartDetailModel.findOne({
      cart_id: cart._id,
      course_id: new Types.ObjectId(courseId),
    });

    if (existingCartDetail) {
      throw new BadRequestException('Khóa học đã có trong giỏ hàng');
    }

    await this.cartDetailModel.create({
      cart_id: cart._id,
      course_id: new Types.ObjectId(courseId),
      price: course.price,
    });

    const cartResponse = await this.buildCartResponse(cart._id);

    return new ApiResponse(
      'Thêm khóa học vào giỏ hàng thành công',
      cartResponse,
    );
  }

  async updateCart(
    userId: string,
    updateCartDto: UpdateCartDto,
  ): Promise<ApiResponse<any>> {
    const { courseId } = updateCartDto;

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('courseId không hợp lệ');
    }

    const cart = await this.cartModel.findOne({
      user_id: new Types.ObjectId(userId),
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const cartDetail = await this.cartDetailModel.findOne({
      cart_id: cart._id,
      course_id: new Types.ObjectId(courseId),
    });

    if (!cartDetail) {
      throw new NotFoundException('Khóa học không tồn tại trong giỏ hàng');
    }

    const course = await this.courseModel.findById(courseId).lean();
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }

    cartDetail.price = course.price;
    await cartDetail.save();

    const cartResponse = await this.buildCartResponse(cart._id);

    return new ApiResponse('Cập nhật giỏ hàng thành công', cartResponse);
  }

  async deleteProductInCart(
    userId: string,
    courseId: string,
  ): Promise<ApiResponse<any>> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('courseId không hợp lệ');
    }

    const cart = await this.cartModel.findOne({
      user_id: new Types.ObjectId(userId),
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const deleted = await this.cartDetailModel.findOneAndDelete({
      cart_id: cart._id,
      course_id: new Types.ObjectId(courseId),
    });

    if (!deleted) {
      throw new NotFoundException('Khóa học không tồn tại trong giỏ hàng');
    }

    const cartResponse = await this.buildCartResponse(cart._id);

    return new ApiResponse(
      'Xóa khóa học khỏi giỏ hàng thành công',
      cartResponse,
    );
  }

  async getCartInUser(userId: string): Promise<ApiResponse<any>> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    const cart = await this.findOrCreateCart(userId);
    const cartResponse = await this.buildCartResponse(cart._id);

    return new ApiResponse('Lấy giỏ hàng thành công', cartResponse);
  }

  async clearCart(userId: string): Promise<ApiResponse<null>> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    const cart = await this.cartModel.findOne({
      user_id: new Types.ObjectId(userId),
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    await this.cartDetailModel.deleteMany({
      cart_id: cart._id,
    });

    return new ApiResponse('Xóa toàn bộ giỏ hàng thành công', null);
  }

  async countCartItems(userId: string): Promise<ApiResponse<number>> {
    const cart = await this.findOrCreateCart(userId);
    const cartDetails = await this.cartDetailModel.find({
      cart_id: cart._id,
    });

    return new ApiResponse(
      'Số lượng sản phẩm trong giỏ hàng',
      cartDetails.length,
    );
  }
}
