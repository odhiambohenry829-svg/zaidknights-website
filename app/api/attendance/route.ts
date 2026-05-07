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
  const memberId = searchParams.get("memberId") || undefined;

  const attendance = await prisma.attendance.findMany({
    where: { eventId, memberId },
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { title: true, startDate: true } },
      user: { select: { id: true, name: true } },
      member: { select: { id: true, rating: true } },
      organization: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ attendance });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const eventId = stringValue(data.eventId);
  const userId = stringValue(data.userId);
  const memberId = stringValue(data.memberId);

  if (!eventId || (!userId && !memberId)) {
    return jsonError("eventId and either userId or memberId are required.");
  }

  const payload = {
    eventId,
    userId: userId || null,
    memberId: memberId || null,
    organizationId: stringValue(data.organizationId) || null,
    recordedById: stringValue(data.recordedById) || null,
    status: (stringValue(data.status) || "PRESENT") as
      | "PRESENT"
      | "ABSENT"
      | "LATE"
      | "EXCUSED",
    checkedInAt: data.checkedInAt ? new Date(stringValue(data.checkedInAt)) : new Date(),
    notes: stringValue(data.notes) || null,
  };

  const attendance = userId
    ? await prisma.attendance.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
        update: {
          status: payload.status,
          checkedInAt: payload.checkedInAt,
          notes: payload.notes,
        },
        create: payload,
      })
    : await prisma.attendance.upsert({
        where: {
          eventId_memberId: {
            eventId,
            memberId,
          },
        },
        update: {
          status: payload.status,
          checkedInAt: payload.checkedInAt,
          notes: payload.notes,
        },
        create: payload,
      });

  return NextResponse.json({ attendance }, { status: 201 });
}
