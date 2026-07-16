import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private apiKey: string;
  private username: string;
  private senderId: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('AT_API_KEY', '');
    this.username = this.config.get('AT_USERNAME', 'buspawa');
    this.senderId = this.config.get('AT_SENDER_ID', 'BUSPAWA');
  }

  private get baseUrl(): string {
    return 'https://api.africastalking.com/version1/messaging';
  }

  async sendBookingConfirmation(phone: string, passengerName: string, ticketRef: string, route: string, seat: number, departureTime: string) {
    const message = `Hi ${passengerName}, your booking is confirmed!\nTicket: ${ticketRef}\nRoute: ${route}\nSeat: ${seat}\nDeparture: ${departureTime}\nShow this SMS at the counter.\n- BusPawa`;
    return this.send(phone, message);
  }

  async sendParcelNotification(phone: string, trackingCode: string, status: string, location: string) {
    const message = `Parcel ${trackingCode} status: ${status}${location ? ` at ${location}` : ''}.\n- BusPawa`;
    return this.send(phone, message);
  }

  async sendPaymentConfirmation(phone: string, amount: number, ref: string) {
    const message = `KES ${amount} received for ${ref}. M-Pesa confirmed.\n- BusPawa`;
    return this.send(phone, message);
  }

  async sendComplianceAlert(phone: string, vehicle: string, alertType: string, due: string) {
    const message = `COMPLIANCE ALERT: ${vehicle} - ${alertType} ${due}. Please arrange renewal immediately.\n- BusPawa Admin`;
    return this.send(phone, message);
  }

  async sendTillAlert(phone: string, agentName: string, variance: number) {
    const message = `Till Variance Alert: ${agentName}'s session has a variance of KES ${variance}. Please review.\n- BusPawa`;
    return this.send(phone, message);
  }

  private async send(phoneNumber: string, message: string): Promise<any> {
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;
      const response = await axios.post(
        this.baseUrl,
        `username=${this.username}&to=${formattedPhone}&message=${encodeURIComponent(message)}&from=${this.senderId}`,
        {
          headers: {
            apiKey: this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('SMS send failed:', error?.response?.data || error.message);
      return { success: false, error: error?.response?.data || error.message };
    }
  }
}
