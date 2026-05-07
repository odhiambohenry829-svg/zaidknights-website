import { NextResponse } from "next/server";
import { jsonError, requireAdmin, stringValue } from "../../../lib/api";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const blocked = requireAdmin(request);

  if (blocked) {
    return blocked;
  }

  const data = await request.json();
  const title = stringValue(data.title);
  const slug = stringValue(data.slug);
  const excerpt = stringValue(data.excerpt);
  const content = stringValue(data.content);
  const authorId = stringValue(data.authorId);
  const published = Boolean(data.published);

  if (!title || !slug || !excerpt || !content || !authorId) {
    return jsonError("Missing required post fields.");
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      authorId,
      published,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
