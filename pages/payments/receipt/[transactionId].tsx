import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { EtimsReceiptData } from '../../../lib/etims';

export default function ReceiptPage() {
  const router = useRouter();
  const { transactionId } = router.query;
  const [receipt, setReceipt] = useState<EtimsReceiptData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId || typeof transactionId !== 'string') return;
    fetch(`/api/payments/receipt/${transactionId}`)
      .then(r => {
        if (!r.ok) return r.json().then(e => Promise.reject(e.error));
        return r.json();
      })
      .then(setReceipt)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading receipt…</div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-sm">{error || 'Receipt not found'}</div>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(receipt.verificationUrl)}`;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-sm">Receipt {receipt.receiptNo}</span>
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
            Verified
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/payments/receipt/${transactionId}?format=html`}
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition"
          >
            Full Receipt
          </a>
          <button
            onClick={() => window.print()}
            className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded transition"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Receipt card */}
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto bg-white border-2 border-gray-900 p-7 font-mono text-xs text-gray-900 shadow-lg">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-900 pb-4 mb-4">
            <div className="inline-block bg-gray-900 text-white text-[9px] tracking-widest px-3 py-0.5 mb-2">
              SALES RECEIPT
            </div>
            <h1 className="text-lg font-bold tracking-wide">{receipt.sellerName}</h1>
            <p className="text-gray-500 text-[10px]">{receipt.sellerAddress}</p>
            {receipt.sellerPin && (
              <p className="text-gray-500 text-[10px]">KRA PIN: {receipt.sellerPin}</p>
            )}
            <p className="font-bold text-sm mt-2">Receipt No: {receipt.receiptNo}</p>
            <p className="text-gray-500 text-[10px]">{receipt.date} &nbsp;|&nbsp; {receipt.time}</p>
          </div>

          {/* Buyer */}
          <div className="mb-4">
            <p className="font-bold text-[9px] uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
              Buyer Information
            </p>
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-bold">{receipt.buyerName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-bold">{receipt.buyerPhone}</span></div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <p className="font-bold text-[9px] uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
              Items
            </p>
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-1 px-1">Description</th>
                  <th className="text-center py-1 px-1">Qty</th>
                  <th className="text-right py-1 px-1">Net</th>
                  <th className="text-center py-1 px-1">Tax</th>
                  <th className="text-right py-1 px-1">Gross</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1 px-1">{item.description}</td>
                    <td className="text-center py-1 px-1">{item.quantity}</td>
                    <td className="text-right py-1 px-1">{item.netAmount.toFixed(2)}</td>
                    <td className="text-center py-1 px-1">{item.vatCode}</td>
                    <td className="text-right py-1 px-1 font-bold">{item.grossAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax summary */}
          <div className="mb-4">
            <p className="font-bold text-[9px] uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
              Tax Summary (KES)
            </p>
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-1 px-1">Code</th>
                  <th className="text-right py-1 px-1">Net</th>
                  <th className="text-center py-1 px-1">Rate</th>
                  <th className="text-right py-1 px-1">Tax</th>
                  <th className="text-right py-1 px-1">Gross</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-1">A — Standard (16%)</td>
                  <td className="text-right py-1 px-1">{receipt.netA.toFixed(2)}</td>
                  <td className="text-center py-1 px-1">16.00%</td>
                  <td className="text-right py-1 px-1">{receipt.vatA.toFixed(2)}</td>
                  <td className="text-right py-1 px-1">{receipt.grossA.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-1">C — Exempt</td>
                  <td className="text-right py-1 px-1">{receipt.netC.toFixed(2)}</td>
                  <td className="text-center py-1 px-1">—</td>
                  <td className="text-right py-1 px-1">0.00</td>
                  <td className="text-right py-1 px-1">{receipt.netC.toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-gray-900 font-bold">
                  <td className="py-1.5 px-1">TOTAL</td>
                  <td className="text-right py-1.5 px-1">{receipt.totalNet.toFixed(2)}</td>
                  <td></td>
                  <td className="text-right py-1.5 px-1">{receipt.totalVat.toFixed(2)}</td>
                  <td className="text-right py-1.5 px-1 text-green-700 text-sm">KES {receipt.totalGross.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment */}
          <div className="mb-4">
            <p className="font-bold text-[9px] uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
              Payment
            </p>
            <div className="flex justify-between"><span className="text-gray-500">Method:</span><span className="font-bold">M-PESA</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">M-PESA Code:</span>
              <span className="font-bold text-green-700">{receipt.mpesaCode}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-500">Amount Paid:</span>
              <span className="font-bold text-green-700 text-sm">KES {receipt.totalGross.toFixed(2)}</span>
            </div>
          </div>

          {/* QR */}
          <div className="text-center my-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR code" width={120} height={120} className="inline-block" />
            <p className="text-[9px] text-gray-400 mt-1">Scan to verify receipt</p>
          </div>

          {/* Footer */}
          <div className="text-center border-t border-dashed border-gray-300 pt-3 text-[10px] text-gray-400">
            <div>Ref: {receipt.transactionId}</div>
            <div className="mt-1">Computer-generated receipt · No signature required</div>
            <div className="mt-1">{receipt.sellerName} · {receipt.sellerAddress}</div>
          </div>
        </div>
      </div>
    </>
  );
}
