import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/api";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const [
    totalMembers,
    activeSubscriptions,
    donations,
    organizationsRegistered,
    revenue,
    pendingOrganizations,
    expiredSubscriptions,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.donation.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.organization.count(),
    prisma.paymentTransaction.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.organization.count({ where: { status: "PENDING" } }),
    prisma.subscription.count({ where: { status: "EXPIRED" } }),
  ]);

  return NextResponse.json({
    totalMembers,
    activeSubscriptions,
    donationsSummary: {
      total: donations._sum.amount || 0,
      count: donations._count,
    },
    organizationsRegistered,
    revenueTracking: {
      total: revenue._sum.amount || 0,
      count: revenue._count,
    },
    pendingOrganizations,
    expiredSubscriptions,
  });
}
