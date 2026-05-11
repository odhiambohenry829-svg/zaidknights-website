// Safaricom Daraja API — M-PESA STK Push (Lipa Na M-PESA Online)
// Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

const BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY    = process.env.MPESA_CONSUMER_KEY!.trim();
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!.trim();
const PAYBILL         = process.env.MPESA_PAYBILL!.trim();
const PASSKEY         = process.env.MPESA_PASSKEY!.trim();
const CALLBACK_URL    = process.env.MPESA_CALLBACK_URL!.trim();

function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
}

function getPassword(timestamp: string): string {
  const raw = `${PAYBILL}${PASSKEY}${timestamp}`;
  return Buffer.from(raw).toString('base64');
}

export async function getMpesaToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!res.ok) throw new Error(`MPESA auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export interface StkPushParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface StkPushResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
  const token     = await getMpesaToken();
  const timestamp = getTimestamp();
  const password  = getPassword(timestamp);

  // Normalize phone: strip leading 0 or +254, ensure 254XXXXXXXXX format
  let phone = params.phoneNumber.replace(/\s+/g, '');
  if (phone.startsWith('+')) phone = phone.slice(1);
  if (phone.startsWith('0'))  phone = `254${phone.slice(1)}`;

  const body = {
    BusinessShortCode: PAYBILL,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   'CustomerPayBillOnline',
    Amount:            Math.ceil(params.amount),
    PartyA:            phone,
    PartyB:            PAYBILL,
    PhoneNumber:       phone,
    CallBackURL:       CALLBACK_URL,
    AccountReference:  params.accountReference,
    TransactionDesc:   params.transactionDesc,
  };

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`STK Push failed: ${err}`);
  }

  return res.json() as Promise<StkPushResult>;
}

export interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
}

export function parseMpesaCallback(body: MpesaCallbackBody) {
  const cb = body.Body.stkCallback;
  const success = cb.ResultCode === 0;

  if (!success) {
    return { success: false, checkoutRequestId: cb.CheckoutRequestID, reason: cb.ResultDesc };
  }

  const items = cb.CallbackMetadata?.Item ?? [];
  const get = (name: string) => items.find(i => i.Name === name)?.Value;

  return {
    success:          true,
    checkoutRequestId: cb.CheckoutRequestID,
    mpesaReceiptNo:   String(get('MpesaReceiptNumber') ?? ''),
    amount:           Number(get('Amount') ?? 0),
    phoneNumber:      String(get('PhoneNumber') ?? ''),
    transactionDate:  String(get('TransactionDate') ?? ''),
  };
}
