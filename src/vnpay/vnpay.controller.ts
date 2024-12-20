import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

// Thêm DTO để định nghĩa body
class CreatePaymentDto {
  @ApiProperty({ example: 100000, description: 'Số tiền thanh toán (VND)' })
  amount: number;

  @ApiProperty({ example: 'ORDER_123', description: 'Mã đơn hàng' })
  orderId: string;

  @ApiProperty({
    example: 'Thanh toan don hang #123',
    description: 'Thông tin đơn hàng',
  })
  orderInfo: string;
}

// Thêm response DTO
class PaymentResponseDto {
  @ApiProperty()
  paymentUrl: string;
}

@ApiTags('Payment')
@Controller('payment')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Post('create')
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: PaymentResponseDto,
  })
  async createPayment(@Body() body: CreatePaymentDto) {
    const { amount, orderId, orderInfo } = body;
    const paymentUrl = this.vnpayService.createPaymentUrl(
      orderId,
      amount,
      orderInfo,
    );
    return { paymentUrl };
  }

  @Get('vnpay-return')
  @ApiOperation({ summary: 'Xử lý kết quả thanh toán từ VNPay' })
  @ApiResponse({ status: 200, description: 'Success' })
  async vnpayReturn(@Query() query: any) {
    const isValidSignature = this.vnpayService.verifyReturnUrl(query);

    if (!isValidSignature) {
      return { status: 'error', message: 'Invalid signature' };
    }

    const paymentStatus =
      query['vnp_ResponseCode'] === '00' ? 'success' : 'failed';

    return {
      status: paymentStatus,
      message:
        paymentStatus === 'success' ? 'Payment successful' : 'Payment failed',
      data: query,
    };
  }
}
