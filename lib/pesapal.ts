// lib/pesapal.ts
// Pesapal API 3.0 Integration

const PESAPAL_BASE_URL = process.env.PESAPAL_ENV === 'production'
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3';

const CONSUMER_KEY    = process.env.PESAPAL_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET!;

// ── Get Auth Token ──────────────────────────────────────────────
export async function getPesapalToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Failed to get Pesapal token: ' + JSON.stringify(data));
  return data.token;
}

// ── Register IPN URL ────────────────────────────────────────────
export async function registerIPN(token: string): Promise<string> {
  const ipnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/pesapal/ipn`;
  const res = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' }),
  });
  const data = await res.json();
  if (!data.ipn_id) throw new Error('Failed to register IPN: ' + JSON.stringify(data));
  return data.ipn_id;
}

// ── Submit Order ────────────────────────────────────────────────
export async function submitOrder(params: {
  token: string;
  ipnId: string;
  amount: number;
  currency: string;
  reference: string;
  description: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<{ order_tracking_id: string; redirect_url: string }> {
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success`;

  const body = {
    id: params.reference,
    currency: params.currency,
    amount: params.amount,
    description: params.description,
    callback_url: callbackUrl,
    notification_id: params.ipnId,
    billing_address: {
      first_name: params.firstName,
      last_name:  params.lastName,
      email_address: params.email,
      phone_number: params.phone,
      country_code: 'KE',
    },
  };

  const res = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${params.token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.order_tracking_id) throw new Error('Failed to submit order: ' + JSON.stringify(data));
  return { order_tracking_id: data.order_tracking_id, redirect_url: data.redirect_url };
}

// ── Get Transaction Status ──────────────────────────────────────
export async function getTransactionStatus(token: string, orderTrackingId: string) {
  const res = await fetch(
    `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return res.json();
}
