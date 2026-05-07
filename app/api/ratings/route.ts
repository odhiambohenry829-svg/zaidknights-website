import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const history = await prisma.chessRatingHistory.findMany({
    where: { memberId, userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const rating = Number(data.rating);
  const memberId = stringValue(data.memberId);
  const userId = stringValue(data.userId);

  if (!Number.isInteger(rating) || (!memberId && !userId)) {
    return jsonError("rating and either memberId or userId are required.");
  }

  const entry = await prisma.chessRatingHistory.create({
    data: {
      memberId: memberId || null,
      userId: userId || null,
      eventId: stringValue(data.eventId) || null,
      ratingType: (stringValue(data.ratingType) || "INTERNAL") as "ELO" | "INTERNAL",
      rating,
      previousRating: data.previousRating ? Number(data.previousRating) : null,
      change: data.change ? Number(data.change) : null,
      source: stringValue(data.source) || null,
    },
  });

  if (memberId) {
    await prisma.member.update({
      where: { id: memberId },
      data:
        entry.ratingType === "ELO"
          ? { eloRating: rating }
          : { rating, internalRating: rating },
    });
  }

  return NextResponse.json({ entry }, { status: 201 });
}
