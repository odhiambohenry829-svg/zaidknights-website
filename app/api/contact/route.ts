import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const message = String(data.message || "").trim();

  if (name.length < 2 || !isValidEmail(email) || message.length < 10) {
    return NextResponse.json(
      { error: "Please provide a valid name, email, and message." },
      { status: 400 },
    );
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });
  } catch (error) {
    console.error("Failed to save contact message", error);

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Message could not be saved right now." },
        { status: 503 },
      );
    }

    return NextResponse.redirect(new URL("/contact?error=database", request.url), {
      status: 303,
    });
  }

  if (contentType.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.redirect(new URL("/contact?sent=1", request.url), {
    status: 303,
  });
}
