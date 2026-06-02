// eTIMS-compliant receipt generation (Kenya Revenue Authority format)
// Tax codes: A = VAT 16%, B = VAT 8%, C = Exempt, D = Zero-rated
// Chess club services (membership, donations) are VAT-exempt → code C

export interface EtimsItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatCode: 'A' | 'C';
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
}

export interface EtimsReceiptData {
  receiptNo: string;
  date: string;
  time: string;
  sellerName: string;
  sellerPin: string;
  sellerAddress: string;
  buyerName: string;
  buyerPhone: string;
  items: EtimsItem[];
  // Tax summary by category
  netA: number; vatA: number; grossA: number;
  netC: number;
  totalNet: number;
  totalVat: number;
  totalGross: number;
  mpesaCode: string;
  transactionId: string;
  verificationUrl: string;
}

function generateReceiptNo(transactionId: string): string {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = transactionId.replace(/-/g, '').slice(-6).toUpperCase();
  return `ZK${ymd}${suffix}`;
}

export function buildEtimsReceipt(params: {
  transactionId: string;
  mpesaCode: string;
  amount: number;
  buyerName: string;
  buyerPhone: string;
  description: string;
  vatCode?: 'A' | 'C';
}): EtimsReceiptData {
  const vatCode = params.vatCode ?? 'C';
  const grossAmount = params.amount;
  const netAmount = vatCode === 'A'
    ? Math.round((grossAmount / 1.16) * 100) / 100
    : grossAmount;
  const vatAmount = Math.round((grossAmount - netAmount) * 100) / 100;

  const item: EtimsItem = {
    description: params.description,
    quantity: 1,
    unitPrice: netAmount,
    vatCode,
    netAmount,
    vatAmount,
    grossAmount,
  };

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zaidknights.org';

  return {
    receiptNo: generateReceiptNo(params.transactionId),
    date: new Date().toLocaleDateString('en-GB'),   // DD/MM/YYYY
    time: new Date().toLocaleTimeString('en-KE', { hour12: false }),
    sellerName: process.env.BUSINESS_NAME ?? 'ZaidKnights Chess Club',
    sellerPin: process.env.KRA_PIN ?? '',
    sellerAddress: process.env.BUSINESS_ADDRESS ?? 'Nairobi, Kenya',
    buyerName: params.buyerName,
    buyerPhone: params.buyerPhone,
    items: [item],
    netA: vatCode === 'A' ? netAmount : 0,
    vatA: vatCode === 'A' ? vatAmount : 0,
    grossA: vatCode === 'A' ? grossAmount : 0,
    netC: vatCode === 'C' ? netAmount : 0,
    totalNet: netAmount,
    totalVat: vatAmount,
    totalGross: grossAmount,
    mpesaCode: params.mpesaCode,
    transactionId: params.transactionId,
    verificationUrl: `${SITE}/payments/receipt/${params.transactionId}`,
  };
}

export function renderEtimsHtml(r: EtimsReceiptData): string {
  const itemRows = r.items.map(i => `
    <tr>
      <td class="td-left">${i.description}</td>
      <td class="td-center">${i.quantity}</td>
      <td class="td-right">${i.unitPrice.toFixed(2)}</td>
      <td class="td-center">${i.vatCode}</td>
      <td class="td-right">${i.netAmount.toFixed(2)}</td>
      <td class="td-right">${i.vatAmount.toFixed(2)}</td>
      <td class="td-right fw">${i.grossAmount.toFixed(2)}</td>
    </tr>`).join('');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(r.verificationUrl)}`;
  const pinRow = r.sellerPin ? `<div class="kv"><span>KRA PIN:</span><span>${r.sellerPin}</span></div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Receipt ${r.receiptNo}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Courier New',monospace;font-size:12px;color:#111;background:#f9fafb;padding:20px}
.receipt{max-width:640px;margin:0 auto;background:#fff;border:2px solid #111;padding:24px}
.hdr{text-align:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:14px}
.hdr .badge{display:inline-block;background:#111;color:#fff;font-size:9px;letter-spacing:2px;padding:2px 10px;margin-bottom:6px}
.hdr h1{font-size:17px;font-weight:bold;letter-spacing:1px}
.hdr .sub{font-size:10px;color:#555;margin-top:2px}
.rno{font-size:15px;font-weight:bold;margin-top:8px}
.sec{margin-bottom:14px}
.sec-title{font-weight:bold;font-size:9px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #ccc;padding-bottom:3px;margin-bottom:6px}
.kv{display:flex;justify-content:space-between;margin-bottom:3px}
.kv span:first-child{color:#555}
.kv span:last-child{font-weight:bold}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#f3f4f6;padding:5px 6px;border-bottom:2px solid #111;font-size:9px;text-transform:uppercase;font-weight:bold}
td{padding:5px 6px;border-bottom:1px solid #e5e7eb}
.td-left{text-align:left}.td-center{text-align:center}.td-right{text-align:right}.fw{font-weight:bold}
.total-row td{font-weight:bold;font-size:13px;border-top:2px solid #111}
.paid{font-size:20px;font-weight:bold;color:#15803d}
.mpesa{color:#15803d;font-weight:bold;font-size:13px}
.qr-wrap{text-align:center;margin:14px 0}
.ftr{text-align:center;border-top:1px dashed #ccc;padding-top:10px;margin-top:14px;font-size:10px;color:#666}
.print-btn{display:block;margin:20px auto;background:#111;color:#fff;border:none;padding:10px 28px;font-size:13px;cursor:pointer;border-radius:4px}
@media print{body{background:#fff;padding:0}.receipt{border:none}.no-print{display:none}}
</style>
</head>
<body>
<div class="receipt">
  <div class="hdr">
    <div class="badge">SALES RECEIPT</div>
    <h1>${r.sellerName}</h1>
    <div class="sub">${r.sellerAddress}</div>
    ${pinRow}
    <div class="rno">Receipt No: ${r.receiptNo}</div>
    <div class="sub">${r.date} &nbsp;|&nbsp; ${r.time}</div>
  </div>

  <div class="sec">
    <div class="sec-title">Buyer Information</div>
    <div class="kv"><span>Name:</span><span>${r.buyerName}</span></div>
    <div class="kv"><span>Phone:</span><span>${r.buyerPhone}</span></div>
  </div>

  <div class="sec">
    <div class="sec-title">Items</div>
    <table>
      <thead>
        <tr>
          <th class="td-left" style="width:36%">Description</th>
          <th class="td-center">Qty</th>
          <th class="td-right">Unit Price</th>
          <th class="td-center">Tax</th>
          <th class="td-right">Net</th>
          <th class="td-right">VAT</th>
          <th class="td-right">Gross</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>

  <div class="sec">
    <div class="sec-title">Tax Summary (KES)</div>
    <table>
      <thead>
        <tr>
          <th class="td-left">Code</th>
          <th class="td-right">Net</th>
          <th class="td-center">Rate</th>
          <th class="td-right">Tax</th>
          <th class="td-right">Gross</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="td-left">A — Standard (16%)</td>
          <td class="td-right">${r.netA.toFixed(2)}</td>
          <td class="td-center">16.00%</td>
          <td class="td-right">${r.vatA.toFixed(2)}</td>
          <td class="td-right">${r.grossA.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="td-left">C — Exempt</td>
          <td class="td-right">${r.netC.toFixed(2)}</td>
          <td class="td-center">—</td>
          <td class="td-right">0.00</td>
          <td class="td-right">${r.netC.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td class="td-left">TOTAL</td>
          <td class="td-right">${r.totalNet.toFixed(2)}</td>
          <td></td>
          <td class="td-right">${r.totalVat.toFixed(2)}</td>
          <td class="td-right paid">KES ${r.totalGross.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="sec">
    <div class="sec-title">Payment Details</div>
    <div class="kv"><span>Method:</span><span>M-PESA</span></div>
    <div class="kv"><span>M-PESA Code:</span><span class="mpesa">${r.mpesaCode}</span></div>
    <div class="kv"><span>Amount Paid:</span><span class="paid">KES ${r.totalGross.toFixed(2)}</span></div>
  </div>

  <div class="qr-wrap">
    <img src="${qrUrl}" alt="Scan to verify" width="120" height="120"/>
    <div style="font-size:9px;color:#888;margin-top:4px">Scan QR to verify this receipt</div>
  </div>

  <div class="ftr">
    <div>Ref: ${r.transactionId}</div>
    <div style="margin-top:4px">This is a computer-generated receipt · No signature required</div>
    <div style="margin-top:2px">${r.sellerName} · ${r.sellerAddress}</div>
  </div>
</div>

<button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>
</body>
</html>`;
}

// Inline receipt block for embedding in email
export function inlineEtimsBlock(r: EtimsReceiptData): string {
  return `
    <div style="background:#f9fafb;border:1px solid #d1d5db;border-radius:8px;padding:16px;margin:16px 0;font-family:'Courier New',monospace;font-size:12px;">
      <div style="font-weight:bold;font-size:13px;color:#111;border-bottom:1px solid #d1d5db;padding-bottom:8px;margin-bottom:10px;">
        eTIMS SALES RECEIPT — ${r.receiptNo}
      </div>
      <div style="color:#555;">${r.date} &nbsp; ${r.time}</div>
      <div style="margin-top:8px;"><strong>Seller:</strong> ${r.sellerName}${r.sellerPin ? ` (PIN: ${r.sellerPin})` : ''}</div>
      <div><strong>Buyer:</strong> ${r.buyerName} · ${r.buyerPhone}</div>
      <table style="width:100%;margin-top:10px;border-collapse:collapse;font-size:11px;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:4px 0;color:#555;">Description</td>
          <td style="padding:4px 0;text-align:right;color:#555;">Net</td>
          <td style="padding:4px 0;text-align:right;color:#555;">VAT</td>
          <td style="padding:4px 0;text-align:right;color:#555;">Gross</td>
        </tr>
        ${r.items.map(i => `
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:4px 0;">${i.description}</td>
          <td style="padding:4px 0;text-align:right;">${i.netAmount.toFixed(2)}</td>
          <td style="padding:4px 0;text-align:right;">${i.vatAmount.toFixed(2)}</td>
          <td style="padding:4px 0;text-align:right;font-weight:bold;">${i.grossAmount.toFixed(2)}</td>
        </tr>`).join('')}
        <tr>
          <td style="padding:6px 0;font-weight:bold;" colspan="3">TOTAL (KES)</td>
          <td style="padding:6px 0;font-weight:bold;font-size:14px;text-align:right;color:#15803d;">KES ${r.totalGross.toFixed(2)}</td>
        </tr>
      </table>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e5e7eb;">
        <strong>M-PESA Code:</strong> <span style="color:#15803d;font-weight:bold;">${r.mpesaCode}</span>
      </div>
      <div style="margin-top:6px;font-size:10px;color:#888;">
        Receipt Ref: ${r.receiptNo} · Tx: ${r.transactionId}
      </div>
    </div>`;
}
