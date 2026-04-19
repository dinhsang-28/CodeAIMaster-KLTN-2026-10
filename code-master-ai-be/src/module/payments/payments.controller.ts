import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment.dto';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createPayment(@CurrentUser() user: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-payments')
  getMyPayments(@CurrentUser() user: any) {
    return this.paymentsService.getMyPayments(user._id);
  }

  @Get('vnpay-callback')
  async vnpayCallback(@Query() query: any, @Res() res: Response) {
    const { vnp_ResponseCode, vnp_TxnRef } = query;
    const orderid = vnp_TxnRef.split('_')[0];
    if (vnp_ResponseCode !== '00') {
      return res.redirect(
        `https://code-ai-master-kltn-2026-10.vercel.app/payment-fail/${orderid}`,
        // `http://localhost:3000/payment-fail/${orderid}`
      );
    }

    await this.paymentsService.markPaymentPaidAndClearCartByOrder(orderid);
    return res.redirect(
      `https://code-ai-master-kltn-2026-10.vercel.app/payment-success/${orderid}`,
    );
  }
  @Post('momo-ipn')
  async momoIpn(@Body() body: any) {
    console.log('MOMO IPN BODY:', body);
    await this.paymentsService.handleMomoIpn(body);
    return { message: 'IPN processed successfully' };
  }

  @Get('momo-return')
  async momoReturn(@Query() query: any, @Res() res: Response) {
    const { orderId, resultCode } = query;

    if (Number(resultCode) !== 0) {
      return res.redirect(
        `https://code-ai-master-kltn-2026-10.vercel.app/payment-fail/${orderId}`,
      );
    }

    return res.redirect(
      `https://code-ai-master-kltn-2026-10.vercel.app/payment-success/${orderId}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-order/:orderId')
  getPaymentByOrderId(@Param('orderId', ParseObjectIdPipe) orderId: string) {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getPaymentById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updatePaymentStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updatePaymentStatus(id, dto);
  }
}
