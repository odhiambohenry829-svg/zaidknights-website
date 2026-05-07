import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: {
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
      organization: { select: { id: true, name: true } },
      trainingGroup: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const title = stringValue(data.title);
  const message = stringValue(data.message);
  const createdById = stringValue(data.createdById);

  if (!title || !message || !createdById) {
    return jsonError("title, message, and createdById are required.");
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      message,
      createdById,
      audience: (stringValue(data.audience) || "ALL") as
        | "ALL"
        | "MEMBERS"
        | "COACHES"
        | "ORGANIZATION"
        | "GROUP",
      organizationId: stringValue(data.organizationId) || null,
      trainingGroupId: stringValue(data.trainingGroupId) || null,
      publishedAt: data.publishNow === false ? null : new Date(),
    },
  });

  return NextResponse.json({ announcement }, { status: 201 });
}
