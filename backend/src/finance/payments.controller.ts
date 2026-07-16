import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { MpesaService } from '../common/config/mpesa.service';
import { SmsService } from '../common/config/sms.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private mpesaService: MpesaService,
    private smsService: SmsService,
  ) {}

  @Post('mpesa/stkpush')
  async initiatePayment(@Body() body: { phoneNumber: string; amount: number; accountRef: string }) {
    this.logger.log(`Initiating M-Pesa STK push for ${body.phoneNumber} - KES ${body.amount}`);
    return this.mpesaService.initiateSTKPush(body.phoneNumber, body.amount, body.accountRef);
  }

  @Post('mpesa/callback')
  async handleCallback(@Body() body: any) {
    this.logger.log('M-Pesa callback received');

    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) return { ResultCode: 0, ResultDesc: 'OK' };

    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    if (resultCode === 0) {
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const amount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
      const mpesaReceipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = metadata.find((i: any) => i.Name === 'PhoneNumber')?.Value;

      this.logger.log(`Payment successful: ${mpesaReceipt} - KES ${amount} from ${phoneNumber}`);

      // TODO: Update ticket/parcel payment status in database
      // TODO: Send confirmation SMS
    } else {
      this.logger.warn(`Payment failed: ${resultDesc}`);
    }

    return { ResultCode: 0, ResultDesc: 'OK' };
  }

  @Post('mpesa/query')
  async queryTransaction(@Body() body: { checkoutRequestId: string }) {
    return this.mpesaService.queryTransaction(body.checkoutRequestId);
  }
}
