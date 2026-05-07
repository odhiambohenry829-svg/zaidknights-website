import { NextResponse } from "next/server";
import {
  boolValue,
  jsonError,
  redirectOrJson,
  requestData,
  stringValue,
} from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

function nextMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}

export async function GET() {
  const [summary, leaderboard, campaigns] = await Promise.all([
    prisma.donation.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.donation.findMany({
      where: {
        status: "PAID",
        anonymous: false,
        leaderboardOptIn: true,
      },
      orderBy: { amount: "desc" },
      take: 10,
      select: {
        id: true,
        donorName: true,
        donorType: true,
        category: true,
        amount: true,
        currency: true,
        message: true,
      },
    }),
    prisma.donationCampaign.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    summary: {
      total: summary._sum.amount || 0,
      count: summary._count,
    },
    leaderboard,
    campaigns,
  });
}

export async function POST(request: Request) {
  const { data } = await requestData(request);
  const amount = Number(data.amount);
  const donorName = stringValue(data.donorName);
  const donorEmail = stringValue(data.donorEmail).toLowerCase();
  const donorType = stringValue(data.donorType) || "INDIVIDUAL";
  const category = stringValue(data.category) || "GENERAL_FUND";
  const paymentMethod = stringValue(data.paymentMethod) || "MPESA";
  const frequency = stringValue(data.frequency) || "ONE_TIME";
  const campaignSlug = stringValue(data.campaignSlug);
  const message = stringValue(data.message);

  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonError("Donation amount must be greater than zero.");
  }

  const campaign = campaignSlug
    ? await prisma.donationCampaign.findUnique({ where: { slug: campaignSlug } })
    : null;

  const donation = await prisma.donation.create({
    data: {
      donorName: donorName || null,
      donorEmail: donorEmail || null,
      donorType: donorType as "INDIVIDUAL" | "COMPANY" | "ALUMNI",
      category: category as
        | "TRAINING_EQUIPMENT"
        | "TOURNAMENTS"
        | "TRAVEL_SUPPORT"
        | "GENERAL_FUND",
      amount,
      paymentMethod: paymentMethod as "MPESA" | "CARD" | "BANK_TRANSFER",
      frequency: frequency as "ONE_TIME" | "MONTHLY",
      anonymous: boolValue(data.anonymous),
      leaderboardOptIn: !boolValue(data.anonymous),
      message: message || null,
      taxReceiptRequested: boolValue(data.taxReceiptRequested),
      receiptNumber: `ZK-${Date.now()}`,
      nextBillingAt: frequency === "MONTHLY" ? nextMonth() : null,
      campaignId: campaign?.id,
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      donationId: donation.id,
      amount,
      method: paymentMethod as "MPESA" | "CARD" | "BANK_TRANSFER",
      status: "PENDING",
      description: "Donation pledge",
    },
  });

  return redirectOrJson(request, "/donate?thanks=1", { donation });
}
