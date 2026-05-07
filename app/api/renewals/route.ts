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

function addPlanDuration(plan: string) {
  const end = new Date();

  if (plan === "ANNUAL") {
    end.setFullYear(end.getFullYear() + 1);
  } else if (plan === "TERM") {
    end.setMonth(end.getMonth() + 4);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return end;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId") || undefined;

  const subscriptions = await prisma.subscription.findMany({
    where: { memberId },
    orderBy: { createdAt: "desc" },
    include: {
      paymentTransactions: true,
      renewalReminders: true,
    },
  });

  return NextResponse.json({ subscriptions });
}

export async function POST(request: Request) {
  const { data } = await requestData(request);
  const memberId = stringValue(data.memberId);
  const amount = Number(data.amount);
  const plan = stringValue(data.plan) || "MONTHLY";
  const tier = stringValue(data.tier) || "BEGINNER";
  const paymentMethod = stringValue(data.paymentMethod) || "MPESA";
  const trainingGroupId = stringValue(data.trainingGroupId);
  const autoRenew = boolValue(data.autoRenew);

  if (!memberId || !Number.isFinite(amount) || amount <= 0) {
    return jsonError("memberId and a positive amount are required.");
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } });

  if (!member) {
    return jsonError("Member not found.", 404);
  }

  const endDate = addPlanDuration(plan);
  const gracePeriodEndsAt = new Date(endDate);
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7);

  const membership = await prisma.membership.create({
    data: {
      memberId,
      tier: tier as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "COMPETITIVE_SQUAD" | "FAMILY",
      plan: plan as "MONTHLY" | "TERM" | "ANNUAL",
      status: "PENDING_PAYMENT",
      expiresAt: endDate,
      gracePeriodEndsAt,
      autoRenew,
      trainingGroupId: trainingGroupId || null,
    },
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId: member.userId,
      memberId,
      membershipId: membership.id,
      plan: plan as "MONTHLY" | "TERM" | "ANNUAL",
      tier: tier as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "COMPETITIVE_SQUAD" | "FAMILY",
      amount,
      autoRenew,
      endDate,
      nextBillingDate: autoRenew ? endDate : null,
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      userId: member.userId,
      memberId,
      membershipId: membership.id,
      subscriptionId: subscription.id,
      amount,
      method: paymentMethod as "MPESA" | "CARD" | "BANK_TRANSFER",
      status: "PENDING",
      description: "Membership renewal",
    },
  });

  await prisma.renewalReminder.createMany({
    data: [
      {
        subscriptionId: subscription.id,
        channel: "EMAIL",
        scheduledFor: new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        subscriptionId: subscription.id,
        channel: "SMS",
        scheduledFor: new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  return redirectOrJson(request, "/renew?submitted=1", {
    membership,
    subscription,
  });
}
