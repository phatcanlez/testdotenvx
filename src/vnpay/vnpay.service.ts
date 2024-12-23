import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { ConfigService } from '@nestjs/config';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class VnpayService {
  constructor(
    private configService: ConfigService,
    private websocketGateway: WebsocketGateway,
  ) {}

  createPaymentUrl(orderId: string, amount: number, orderInfo: string) {
    const date = new Date();
    const createDate =
      date.getFullYear().toString() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    const tmnCode = 'FCQGXYEF';
    const secretKey = '5DHWJUAO6ELG2KFHDGET7OCSEK9NF33R';
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = 'http://localhost:3000/payment/vnpay-return';

    const locale = 'vn';
    const currCode = 'VND';

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: 1000000 * 100, // Convert to VND (Vietnamese Dong)
      vnp_ReturnUrl: returnUrl,
      vnp_CreateDate: createDate,
      vnp_IpAddr: '192.168.101.19',
    };

    // const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(vnpParams, { encode: false });
    const signed = this.generateHMAC(secretKey, signData);

    vnpParams['vnp_SecureHash'] = signed;

    return `${vnpUrl}?${querystring.stringify(vnpParams, { encode: false })}`;
  }

  verifyReturnUrl(vnpParams: any): boolean {
    const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const signed = this.generateHMAC(secretKey, signData);

    const isValid = secureHash === signed;

    if (isValid) {
      // Gửi thông báo qua WebSocket khi thanh toán thành công
      this.websocketGateway.sendPaymentNotification({
        status: 'success',
        orderId: vnpParams['vnp_TxnRef'],
        amount: vnpParams['vnp_Amount'],
        paymentTime: vnpParams['vnp_PayDate'],
      });
    }

    return isValid;
  }

  private sortObject(obj: any) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

  private generateHMAC(secretKey: string, data: string): string {
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(data).digest('hex');
    return signed;
  }
}
