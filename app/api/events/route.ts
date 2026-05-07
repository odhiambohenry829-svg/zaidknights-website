import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      _count: {
        select: { registrations: true, results: true },
      },
    },
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const title = stringValue(data.title);
  const slug = stringValue(data.slug);
  const description = stringValue(data.description);
  const location = stringValue(data.location);
  const startDate = new Date(stringValue(data.startDate));
  const endDate = new Date(stringValue(data.endDate));
  const capacity = Number(data.capacity || 32);
  const type = stringValue(data.type) || "CLUB_EVENT";
  const format = stringValue(data.format);

  if (!title || !slug || !description || !location) {
    return jsonError("Missing required event fields.");
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return jsonError("Event dates must be valid ISO date strings.");
  }

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      location,
      startDate,
      endDate,
      capacity,
      type: type as "CLUB_EVENT" | "TOURNAMENT" | "TRAINING" | "SCHOOL_VISIT" | "ORGANIZATION_EVENT",
      format: format
        ? (format as "SWISS" | "ROUND_ROBIN" | "KNOCKOUT" | "ARENA" | "MATCH")
        : null,
      registrationOpensAt: data.registrationOpensAt
        ? new Date(stringValue(data.registrationOpensAt))
        : null,
      registrationClosesAt: data.registrationClosesAt
        ? new Date(stringValue(data.registrationClosesAt))
        : null,
      organizerId: stringValue(data.organizerId) || null,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
