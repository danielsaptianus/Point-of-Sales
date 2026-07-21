import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface RedirectPaymentPayload {
  product: string[];
  qty: number[];
  price: number[];
  amount: number;
  referenceId: string;
}

interface IpaymuRedirectResponse {
  status: number;
  success: boolean;
  message: string;
  Data?: {
    SessionID: string;
    Url: string;
  };
}

@Injectable()
export class IPaymuService {
  private va: string;
  private apiKey: string;
  private isSandbox: boolean;
  private baseUrl: string;
  private returnUrl: string;
  private cancelUrl: string;
  private notifyUrl: string;

  constructor(private configService: ConfigService) {
    this.va = this.configService.get<string>('IPAYMU_VA') || '';
    this.apiKey = this.configService.get<string>('IPAYMU_API_KEY') || '';
    this.isSandbox = this.configService.get<string>('IPAYMU_SANDBOX') === 'true';
    this.baseUrl = this.isSandbox
      ? 'https://sandbox.ipaymu.com/api/v2/payment'
      : 'https://my.ipaymu.com/api/v2/payment';

    this.returnUrl = this.configService.get<string>('IPAYMU_RETURN_URL') || '';
    this.cancelUrl = this.configService.get<string>('IPAYMU_CANCEL_URL') || '';
    this.notifyUrl = this.configService.get<string>('IPAYMU_NOTIFY_URL') || '';
  }

  /**
   * Mengirim request pembuatan sesi transaksi ke iPaymu Redirection API
   */
  async createRedirectPayment(payload: RedirectPaymentPayload): Promise<{ SessionID: string; Url: string }> {
    const requestBody = {
      product: payload.product,
      qty: payload.qty,
      price: payload.price,
      amount: payload.amount,
      returnUrl: this.returnUrl,
      cancelUrl: this.cancelUrl,
      notifyUrl: this.notifyUrl,
      referenceId: payload.referenceId,
    };

    const bodyJson = JSON.stringify(requestBody);
    const bodyHash = crypto.createHash('sha256').update(bodyJson).digest('hex');
    const stringToSign = `POST:${this.va}:${bodyHash}:${this.apiKey}`;
    const signature = crypto.createHmac('sha256', this.apiKey).update(stringToSign).digest('hex');

    console.log('=== IPAYMU DEBUG START ===');
    console.log('Endpoint URL:', this.baseUrl);
    console.log('VA (Header "va"):', this.va);
    console.log('API Key (loaded):', this.apiKey ? `${this.apiKey.substring(0, 12)}...` : 'EMPTY');
    console.log('Body Hash:', bodyHash);
    console.log('String To Sign:', `POST:${this.va}:${bodyHash}:***API_KEY***`);
    console.log('Generated Signature (Header "signature"):', signature);
    console.log('Timestamp (Header "timestamp"):', this.getTimestamp());
    console.log('=== IPAYMU DEBUG END ===');

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'va': this.va,
          'signature': signature,
          'timestamp': this.getTimestamp(),
        },
        body: bodyJson,
      });

      const result: IpaymuRedirectResponse = await response.json();

      const successVal = result.success !== undefined ? result.success : (result as any).Success;
      const dataObj = result.Data || (result as any).data;

      if (!response.ok || successVal !== true || !dataObj) {
        console.error('iPaymu API Error Response:', result);
        const errorMsg = result.message || (result as any).Message || `iPaymu API request failed (HTTP ${response.status})`;
        throw new Error(errorMsg);
      }
 
      return {
        SessionID: dataObj.SessionID || dataObj.sessionId || dataObj.session_id,
        Url: dataObj.Url || dataObj.url,
      };
    } catch (error: any) {
      throw new BadRequestException(`iPaymu SDK Error: ${error.message}`);
    }
  }

  /**
   * Memvalidasi digital signature dari callback webhook iPaymu
   */
  verifyNotificationSignature(headers: Record<string, string>, body: any): boolean {
    const signature = headers['signature'];
    const incomingVa = headers['va'];

    if (!signature || !incomingVa || incomingVa !== this.va) {
      return false;
    }

    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const bodyHash = crypto.createHash('sha256').update(bodyString).digest('hex');
    const stringToSign = `POST:${this.va}:${bodyHash}:${this.apiKey}`;
    const expectedSignature = crypto.createHmac('sha256', this.apiKey).update(stringToSign).digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Helper format timestamp untuk kebutuhan iPaymu header (YYYYMMDDHHmmss)
   */
  private getTimestamp(): string {
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const hh = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
  }
}
