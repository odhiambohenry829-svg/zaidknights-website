import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json({ logs });
}
