import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function requireAdmin(request: Request) {
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    return jsonError("ADMIN_API_KEY is not configured.", 503);
  }

  const provided = request.headers.get("x-admin-key");

  if (provided !== expected) {
    return jsonError("Unauthorized.", 401);
  }

  return null;
}

export function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function boolValue(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export async function requestData(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return {
      data: await request.json(),
      isJson: true,
    };
  }

  return {
    data: Object.fromEntries((await request.formData()).entries()),
    isJson: false,
  };
}

export function redirectOrJson(request: Request, path: string, body: unknown, status = 201) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return Response.json(body, { status });
  }

  return Response.redirect(new URL(path, request.url), 303);
}
