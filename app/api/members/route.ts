import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const members = await prisma.member.findMany({
    orderBy: { joinedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({ members });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const name = stringValue(data.name);
  const email = stringValue(data.email).toLowerCase();
  const passwordHash = stringValue(data.passwordHash || data.password);

  if (!email || !passwordHash) {
    return jsonError("email and passwordHash are required.");
  }

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: passwordHash,
      member: {
        create: {
          level: (stringValue(data.level) || "BEGINNER") as
            | "BEGINNER"
            | "INTERMEDIATE"
            | "ADVANCED"
            | "COMPETITIVE_SQUAD"
            | "MASTER",
          profilePhotoUrl: stringValue(data.profilePhotoUrl) || null,
          eloRating: data.eloRating ? Number(data.eloRating) : null,
          internalRating: data.internalRating ? Number(data.internalRating) : 1200,
          medicalNotes: stringValue(data.medicalNotes) || null,
          emergencyContactName: stringValue(data.emergencyContactName) || null,
          emergencyContactPhone: stringValue(data.emergencyContactPhone) || null,
          guardianName: stringValue(data.guardianName) || null,
          guardianPhone: stringValue(data.guardianPhone) || null,
          trainingGroupId: stringValue(data.trainingGroupId) || null,
        },
      },
    },
    include: {
      member: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
