import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const title = stringValue(data.title);
  const imageUrl = stringValue(data.imageUrl);
  const caption = stringValue(data.caption);

  if (!title || !imageUrl) {
    return jsonError("Title and imageUrl are required.");
  }

  const item = await prisma.galleryItem.create({
    data: {
      title,
      imageUrl,
      caption: caption || null,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
