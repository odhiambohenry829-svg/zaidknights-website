import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const payments = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      donation: true,
      subscription: true,
      organization: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ payments });
}

export async function PATCH(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const id = stringValue(data.id);
  const status = stringValue(data.status);

  if (!id || !["PENDING", "PAID", "FAILED", "REFUNDED", "CANCELLED"].includes(status)) {
    return jsonError("Payment id and valid status are required.");
  }

  const payment = await prisma.paymentTransaction.update({
    where: { id },
    data: {
      status: status as "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED",
      providerReference: stringValue(data.providerReference) || undefined,
      mpesaReceiptNumber: stringValue(data.mpesaReceiptNumber) || undefined,
      paidAt: status === "PAID" ? new Date() : undefined,
    },
  });

  if (payment.donationId) {
    await prisma.donation.update({
      where: { id: payment.donationId },
      data: { status: payment.status },
    });
  }

  if (payment.subscriptionId) {
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: payment.status === "PAID" ? "ACTIVE" : "PENDING_PAYMENT",
      },
    });
  }

  if (payment.membershipId) {
    await prisma.membership.update({
      where: { id: payment.membershipId },
      data: {
        status: payment.status === "PAID" ? "ACTIVE" : "PENDING_PAYMENT",
      },
    });
  }

  if (payment.memberId) {
    await prisma.member.update({
      where: { id: payment.memberId },
      data: {
        status: payment.status === "PAID" ? "ACTIVE" : "PENDING_PAYMENT",
      },
    });
  }

  return NextResponse.json({ payment });
}
