import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../../lib/api";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const organizationId = stringValue(data.organizationId);
  const filename = stringValue(data.filename);

  if (!organizationId || !filename) {
    return jsonError("organizationId and filename are required.");
  }

  const upload = await prisma.bulkUpload.create({
    data: {
      organizationId,
      filename,
      uploadedById: stringValue(data.uploadedById) || null,
      totalRows: Number(data.totalRows || 0),
      status: "PENDING",
    },
  });

  return NextResponse.json({ upload }, { status: 201 });
}
