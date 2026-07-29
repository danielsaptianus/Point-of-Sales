import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface CreateSnapTransactionPayload {
  amount: number;
  referenceId: string;
}

interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

@Injectable()
export class MidtransService {
  private serverKey: string;
  private clientKey: string;
  private isProduction: boolean;
  private baseUrl: string;
  private finishUrl: string;
  private notificationUrl: string;

  constructor(private configService: ConfigService) {
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || '';
    this.clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '';
    this.isProduction = this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';
    this.baseUrl = this.isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    this.finishUrl = this.configService.get<string>('MIDTRANS_FINISH_URL') || '';
    this.notificationUrl = this.configService.get<string>('MIDTRANS_NOTIFICATION_URL') || '';
  }

  /**
   * Mengirim request pembuatan token transaksi Snap ke Midtrans API
   */
  async createSnapTransaction(payload: CreateSnapTransactionPayload): Promise<MidtransSnapResponse> {
    const requestBody: any = {
      transaction_details: {
        order_id: payload.referenceId,
        gross_amount: payload.amount,
      },
      credit_card: {
        secure: true,
      },
    };

    if (this.finishUrl) {
      requestBody.callbacks = {
        finish: this.finishUrl,
      };
    }

    if (this.notificationUrl) {
      requestBody.notification_url = this.notificationUrl;
    }

    const authHeader = 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64');

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.token || !result.redirect_url) {
        console.error('Midtrans API Error Response:', result);
        const errorMsg = result.error_messages ? result.error_messages.join(', ') : `Midtrans API request failed (HTTP ${response.status})`;
        throw new Error(errorMsg);
      }

      return {
        token: result.token,
        redirect_url: result.redirect_url,
      };
    } catch (error: any) {
      throw new BadRequestException(`Midtrans SDK Error: ${error.message}`);
    }
  }

  /**
   * Memvalidasi digital signature dari callback webhook Midtrans
   */
  verifyNotificationSignature(body: any): boolean {
    console.log('=== VERIFY MIDTRANS WEBHOOK SIGNATURE ===');
    console.log('Body:', JSON.stringify(body, null, 2));

    const signatureKey = body.signature_key;
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;

    console.log('Signature Key from Midtrans:', signatureKey);
    console.log('Order ID:', orderId);
    console.log('Status Code:', statusCode);
    console.log('Gross Amount:', grossAmount);
    console.log('Server Key (first 5 chars):', this.serverKey ? this.serverKey.substring(0, 5) + '...' : 'empty');

    if (!signatureKey || !orderId || !statusCode || !grossAmount) {
      console.log('Verification failed: missing signature_key, order_id, status_code, or gross_amount');
      return false;
    }

    // Format signature key hash: SHA512(order_id + status_code + gross_amount + ServerKey)
    const payload = `${orderId}${statusCode}${grossAmount}${this.serverKey}`;
    console.log('Payload string to hash:', payload);

    const expectedSignature = crypto.createHash('sha512').update(payload).digest('hex');
    console.log('Expected Signature Key:', expectedSignature);

    const isMatch = signatureKey === expectedSignature;
    console.log('Is Signature Match?:', isMatch);
    return isMatch;
  }
}
