import { prisma } from "../../../../../lib/prisma";

export const runtime = "nodejs";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const donation = await prisma.donation.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!donation) {
    return new Response("Receipt not found", { status: 404 });
  }

  const donor = donation.anonymous
    ? "Anonymous"
    : donation.donorName || donation.donorEmail || "Supporter";

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Donation Receipt ${donation.receiptNumber || donation.id}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #171a16; margin: 40px; }
    .receipt { max-width: 760px; border: 1px solid #d8ded1; padding: 28px; }
    h1 { margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    td { border-top: 1px solid #d8ded1; padding: 10px 0; }
    td:last-child { text-align: right; font-weight: 700; }
  </style>
</head>
<body>
  <main class="receipt">
    <h1>Zaid Knights Donation Receipt</h1>
    <p>Receipt: ${escapeHtml(donation.receiptNumber || donation.id)}</p>
    <table>
      <tr><td>Donor</td><td>${escapeHtml(donor)}</td></tr>
      <tr><td>Amount</td><td>${escapeHtml(donation.currency)} ${escapeHtml(donation.amount)}</td></tr>
      <tr><td>Category</td><td>${escapeHtml(donation.category)}</td></tr>
      <tr><td>Campaign</td><td>${escapeHtml(donation.campaign?.title || "General")}</td></tr>
      <tr><td>Payment method</td><td>${escapeHtml(donation.paymentMethod)}</td></tr>
      <tr><td>Status</td><td>${escapeHtml(donation.status)}</td></tr>
      <tr><td>Date</td><td>${donation.createdAt.toISOString().slice(0, 10)}</td></tr>
    </table>
  </main>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
