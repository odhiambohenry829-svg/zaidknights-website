import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const results = await prisma.result.findMany({
    where: {
      eventId,
      userId,
    },
    orderBy: [{ score: "desc" }, { wins: "desc" }, { draws: "desc" }],
    include: {
      event: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ results });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const eventId = stringValue(data.eventId);
  const userId = stringValue(data.userId);
  const score = Number(data.score || 0);
  const wins = Number(data.wins || 0);
  const losses = Number(data.losses || 0);
  const draws = Number(data.draws || 0);

  if (!eventId || !userId) {
    return jsonError("eventId and userId are required.");
  }

  const result = await prisma.result.upsert({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
    update: {
      score,
      wins,
      losses,
      draws,
    },
    create: {
      eventId,
      userId,
      score,
      wins,
      losses,
      draws,
    },
  });

  return NextResponse.json({ result }, { status: 201 });
}
