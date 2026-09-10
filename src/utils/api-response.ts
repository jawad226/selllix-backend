import type { Response } from "express";
import type { Pagination } from "../types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  pagination?: Pagination,
  status = 200,
): Response {
  return res.status(status).json({
    success: true,
    data,
    ...(message ? { message } : {}),
    ...(pagination ? { pagination } : {}),
  });
}

export function sendError(res: Response, message: string, code: string, status = 500): Response {
  return res.status(status).json({
    success: false,
    message,
    code,
  });
}

export function paginate<T>(items: T[], page: number, limit: number): { data: T[]; pagination: Pagination } {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  return {
    data: items.slice(start, start + safeLimit),
    pagination: { page: safePage, limit: safeLimit, total, totalPages },
  };
}

export function paginationMeta(page: number, limit: number, total: number): Pagination {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit) || 1),
  };
}
