import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../../../lib/api";
import { prisma } from "../../../../../lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const { id } = await params;
  const data = await request.json();
  const status = stringValue(data.status);

  if (!["APPROVED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
    return jsonError("Invalid organization status.");
  }

  const organization = await prisma.organization.update({
    where: { id },
    data: {
      status: status as "APPROVED" | "REJECTED" | "SUSPENDED" | "PENDING",
      approvedAt: status === "APPROVED" ? new Date() : null,
      rejectedAt: status === "REJECTED" ? new Date() : null,
    },
  });

  return NextResponse.json({ organization });
}
