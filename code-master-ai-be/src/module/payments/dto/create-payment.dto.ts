import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method!: PaymentMethod;
  @IsOptional()
  @IsMongoId()
  courseId?: string;
}
