import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId") || undefined;

  const groups = await prisma.trainingGroup.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      coach: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
      _count: { select: { members: true, organizationMembers: true } },
    },
  });

  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const name = stringValue(data.name);

  if (!name) {
    return jsonError("Training group name is required.");
  }

  const group = await prisma.trainingGroup.create({
    data: {
      name,
      description: stringValue(data.description) || null,
      schedule: stringValue(data.schedule) || null,
      organizationId: stringValue(data.organizationId) || null,
      coachId: stringValue(data.coachId) || null,
    },
  });

  return NextResponse.json({ group }, { status: 201 });
}
