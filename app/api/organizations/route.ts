import { NextResponse } from "next/server";
import {
  jsonError,
  redirectOrJson,
  requestData,
  requireAdmin,
  stringValue,
} from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      coordinator: { select: { id: true, name: true, email: true } },
      _count: {
        select: {
          members: true,
          teams: true,
          paymentTransactions: true,
        },
      },
    },
  });

  return NextResponse.json({ organizations });
}

export async function POST(request: Request) {
  const { data } = await requestData(request);
  const name = stringValue(data.name);
  const type = stringValue(data.type) || "SCHOOL";
  const contactPersonName = stringValue(data.contactPersonName);
  const contactPersonRole = stringValue(data.contactPersonRole);
  const email = stringValue(data.email).toLowerCase();
  const phone = stringValue(data.phone);
  const city = stringValue(data.city);

  if (!name || !contactPersonName || !contactPersonRole || !email || !phone || !city) {
    return jsonError("Missing required organization registration fields.");
  }

  const organization = await prisma.organization.create({
    data: {
      name,
      type: type as "SCHOOL" | "COMPANY" | "ACADEMY" | "CLUB",
      registrationNumber: stringValue(data.registrationNumber) || null,
      county: stringValue(data.county) || null,
      city,
      address: stringValue(data.address) || null,
      contactPersonName,
      contactPersonRole,
      email,
      phone,
      memberCount: Number(data.memberCount || 0),
      interestLevel: (stringValue(data.interestLevel) || "BEGINNER") as
        | "BEGINNER"
        | "ACTIVE"
        | "COMPETITIVE",
      participationType: (stringValue(data.participationType) || "TRAINING_PARTNERSHIP") as
        | "TRAINING_PARTNERSHIP"
        | "TOURNAMENT_ENTRY"
        | "MEMBERSHIP_AFFILIATION",
      preferredTrainingSchedule: stringValue(data.preferredTrainingSchedule) || null,
      competitionHistory: stringValue(data.competitionHistory) || null,
      billingEmail: stringValue(data.billingEmail) || null,
    },
  });

  return redirectOrJson(request, "/organizations?submitted=1", { organization });
}
