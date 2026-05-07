import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const registrations = await prisma.registration.findMany({
    where: {
      eventId,
      userId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      event: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({ registrations });
}

export async function POST(request: Request) {
  const data = await request.json();
  const userId = stringValue(data.userId);
  const eventId = stringValue(data.eventId);

  if (!userId || !eventId) {
    return jsonError("userId and eventId are required.");
  }

  const registration = await prisma.registration.upsert({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
    update: {},
    create: {
      userId,
      eventId,
    },
  });

  return NextResponse.json({ registration }, { status: 201 });
}
