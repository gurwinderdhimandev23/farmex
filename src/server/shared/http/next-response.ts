import { NextRequest, NextResponse } from "next/server";
import { AppError } from "../errors/app-error";
import { verifyAccessToken, TokenPayload } from "../utils/token.utils";
import { UserRole } from "@prisma/client";
import { ZodError } from "zod";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(data: T, status = 200, meta?: PaginationMeta) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request payload",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const err = error as Error;
  console.error("[API_ERROR]", err);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err?.message || "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

export function getAuthUser(req: NextRequest): TokenPayload {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = req.cookies.get("accessToken")?.value;
  }

  if (!token) {
    throw new AppError("Authorization token required", 401, "UNAUTHENTICATED");
  }

  try {
    return verifyAccessToken(token);
  } catch (_err) {
    throw new AppError("Invalid or expired token", 401, "INVALID_TOKEN");
  }
}

export function requireRole(user: TokenPayload, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError("Forbidden: insufficient permissions", 403, "FORBIDDEN");
  }
}
