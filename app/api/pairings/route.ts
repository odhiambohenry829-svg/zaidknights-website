import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;

  const pairings = await prisma.pairing.findMany({
    where: { eventId },
    orderBy: [{ round: "asc" }, { boardNumber: "asc" }],
    include: {
      event: { select: { id: true, title: true } },
      whiteUser: { select: { id: true, name: true } },
      blackUser: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ pairings });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const eventId = stringValue(data.eventId);
  const whiteUserId = stringValue(data.whiteUserId);
  const blackUserId = stringValue(data.blackUserId);
  const round = Number(data.round);
  const boardNumber = Number(data.boardNumber);

  if (!eventId || !whiteUserId || !Number.isInteger(round) || !Number.isInteger(boardNumber)) {
    return jsonError("eventId, whiteUserId, round, and boardNumber are required.");
  }

  const pairing = await prisma.pairing.upsert({
    where: {
      eventId_round_boardNumber: {
        eventId,
        round,
        boardNumber,
      },
    },
    update: {
      whiteUserId,
      blackUserId: blackUserId || null,
      result: (stringValue(data.result) || "PENDING") as
        | "PENDING"
        | "WHITE_WIN"
        | "BLACK_WIN"
        | "DRAW"
        | "BYE"
        | "FORFEIT",
    },
    create: {
      eventId,
      round,
      boardNumber,
      whiteUserId,
      blackUserId: blackUserId || null,
      result: (stringValue(data.result) || "PENDING") as
        | "PENDING"
        | "WHITE_WIN"
        | "BLACK_WIN"
        | "DRAW"
        | "BYE"
        | "FORFEIT",
    },
  });

  return NextResponse.json({ pairing }, { status: 201 });
}
