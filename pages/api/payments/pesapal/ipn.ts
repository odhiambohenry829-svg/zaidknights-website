$content = @'
// pages/api/payments/pesapal/ipn.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPesapalToken, getTransactionStatus } from '../../../../lib/pesapal';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { OrderTrackingId, OrderMerchantReference } = req.query;

  if (!OrderTrackingId) {
    return res.status(400).json({ error: 'Missing OrderTrackingId' });
  }

  try {
    const token  = await getPesapalToken();
    const status = await getTransactionStatus(token, OrderTrackingId as string);

    console.log('Pesapal IPN status:', status);
    console.log('Merchant Reference:', OrderMerchantReference);

    return res.status(200).json({ orderNotificationType: 'IPNCHANGE', orderTrackingId: OrderTrackingId, orderMerchantReference: OrderMerchantReference, status: 200 });
  } catch (err) {
    console.error('Pesapal IPN error:', err);
    return res.status(500).json({ error: 'IPN processing failed' });
  }
}
'@
Set-Content "pages\api\payments\pesapal\ipn.ts" $content -Encoding UTF8