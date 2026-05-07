import { NextResponse } from "next/server";
import { jsonError, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const data = await request.json();
  const userId = stringValue(data.userId);
  const type = stringValue(data.type);
  const granted = data.granted !== false;

  if (!userId || !["TERMS", "PRIVACY", "MEDIA_CONSENT", "MEDICAL_INFORMATION", "COMMUNICATIONS"].includes(type)) {
    return jsonError("userId and a valid consent type are required.");
  }

  const consent = await prisma.dataConsent.upsert({
    where: {
      userId_type: {
        userId,
        type: type as
          | "TERMS"
          | "PRIVACY"
          | "MEDIA_CONSENT"
          | "MEDICAL_INFORMATION"
          | "COMMUNICATIONS",
      },
    },
    update: {
      granted,
      grantedAt: granted ? new Date() : null,
      revokedAt: granted ? null : new Date(),
    },
    create: {
      userId,
      type: type as
        | "TERMS"
        | "PRIVACY"
        | "MEDIA_CONSENT"
        | "MEDICAL_INFORMATION"
        | "COMMUNICATIONS",
      granted,
      grantedAt: granted ? new Date() : null,
      revokedAt: granted ? null : new Date(),
    },
  });

  return NextResponse.json({ consent });
}
