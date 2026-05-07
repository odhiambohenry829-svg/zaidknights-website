import { NextResponse } from "next/server";
import { jsonError } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return jsonError("userId is required.");
  }

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      member: {
        include: {
          trainingGroup: true,
          memberships: { orderBy: { createdAt: "desc" }, take: 3 },
          subscriptions: { orderBy: { createdAt: "desc" }, take: 3 },
          attendanceRecords: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { event: { select: { title: true, startDate: true } } },
          },
          ratingHistory: { orderBy: { createdAt: "desc" }, take: 10 },
          achievements: { orderBy: { awardedAt: "desc" }, take: 10 },
        },
      },
      results: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { event: { select: { title: true, startDate: true } } },
      },
    },
  });

  if (!profile) {
    return jsonError("Profile not found.", 404);
  }

  return NextResponse.json({ profile });
}
