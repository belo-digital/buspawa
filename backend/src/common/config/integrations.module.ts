import { Module, Global } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { SmsService } from './sms.service';

@Global()
@Module({
  providers: [MpesaService, SmsService],
  exports: [MpesaService, SmsService],
})
export class IntegrationsModule {}
