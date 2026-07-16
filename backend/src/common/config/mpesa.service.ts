import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private callbackUrl: string;
  private baseUrl: string;

  constructor(private config: ConfigService) {
    this.consumerKey = this.config.get('MPESA_CONSUMER_KEY', '');
    this.consumerSecret = this.config.get('MPESA_CONSUMER_SECRET', '');
    this.shortcode = this.config.get('MPESA_SHORTCODE', '');
    this.passkey = this.config.get('MPESA_PASSKEY', '');
    this.callbackUrl = this.config.get('MPESA_CALLBACK_URL', '');
    this.baseUrl = this.config.get('MPESA_ENV') === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  async initiateSTKPush(phoneNumber: string, amount: number, accountRef: string) {
    const token = await this.getAccessToken();
    const password = this.generatePassword();
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);

    const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.slice(1)}`;

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: `BusPawa payment for ${accountRef}`,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return response.data;
  }

  async queryTransaction(checkoutRequestId: string) {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
    const password = this.generatePassword();

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return response.data;
  }
}
