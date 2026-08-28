import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface CreateSnapTransactionPayload {
  amount: number;
  referenceId: string;
  onlinePaymentType?: string;
}

interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

/**
 * Service to handle integration with Midtrans Payment Gateway.
 * Supports creating Snap transactions and verifying webhook signatures.
 */
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
   * Mengirim request pembuatan token transaksi Snap ke Midtrans API.
   *
   * @param payload Objek berisi total nominal pembayaran dan ID referensi transaksi (nomor invoice).
   * @returns Promise berisi token Snap dan URL redirect pembayaran.
   */
  async createSnapTransaction(
    payload: CreateSnapTransactionPayload,
  ): Promise<MidtransSnapResponse> {
    const requestBody: any = {
      transaction_details: {
        order_id: payload.referenceId,
        gross_amount: payload.amount,
      },
      credit_card: {
        secure: true,
      },
      custom_expiry: {
        expiry_duration: 10,
        unit: 'minute',
      },
    };

    const paymentMap: Record<string, string[]> = {
      GOPAY: ['gopay'],
      SHOPEEPAY: ['shopeepay'],
      OVO: ['ovo'],
      DANA: ['danamon_online', 'dana'], // usually dana is passed as dana if activated
      LINKAJA: ['linkaja'],
      QRIS: ['other_qris'],
      BCA_VA: ['bca_va'],
      MANDIRI_VA: ['echannel'],
      BNI_VA: ['bni_va'],
      BRI_VA: ['bri_va'],
      PERMATA_VA: ['permata_va'],
      CIMB_VA: ['cimb_va'],
      SEABANK_VA: ['other_va']
    };

    if (payload.onlinePaymentType && paymentMap[payload.onlinePaymentType]) {
      requestBody.enabled_payments = paymentMap[payload.onlinePaymentType];
    }

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
          Accept: 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.token || !result.redirect_url) {
        console.error('Midtrans API Error Response:', result);
        const errorMsg = result.error_messages
          ? result.error_messages.join(', ')
          : `Midtrans API request failed (HTTP ${response.status})`;
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
   * Memvalidasi digital signature dari callback webhook Midtrans.
   *
   * Formula verifikasi: SHA512(order_id + status_code + gross_amount + ServerKey).
   *
   * @param body Payload body request webhook dari Midtrans.
   * @returns Boolean true jika signature valid, false jika tidak cocok atau data tidak lengkap.
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
    console.log(
      'Server Key (first 5 chars):',
      this.serverKey ? this.serverKey.substring(0, 5) + '...' : 'empty',
    );

    if (!signatureKey || !orderId || !statusCode || !grossAmount) {
      console.log(
        'Verification failed: missing signature_key, order_id, status_code, or gross_amount',
      );
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
