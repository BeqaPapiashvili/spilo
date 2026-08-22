import { NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/audit";

interface RateLimitRecord {
  count: number;
  resetTime: number; // Unix timestamp in ms
}

// In-memory sliding window rate limiter store with automatic TTL garbage collection
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Extracts client IP from Request headers reliably.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Synchronously checks and increments rate limit counter for a given key.
 */
export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { key, limit, windowSeconds } = options;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    // Start a new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  // Window still active
  if (existing.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  // Increment counter within existing window
  existing.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));

  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    resetSeconds,
  };
}

/**
 * Resets/clears rate limit for a given key upon successful authentication.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * High-level guard to enforce rate limits inside Next.js route handlers.
 * If exceeded, automatically logs audit event and returns a 429 response.
 */
export async function enforceRateLimit(
  request: Request,
  options: {
    namespace: string;
    identifier?: string;
    limit: number;
    windowSeconds: number;
    customMessage?: string;
  }
): Promise<{ success: boolean; response?: NextResponse }> {
  const clientIp = getClientIp(request);
  const identifier = options.identifier ? options.identifier.trim().toLowerCase() : clientIp;
  const key = `${options.namespace}:${identifier}`;

  const result = checkRateLimit({
    key,
    limit: options.limit,
    windowSeconds: options.windowSeconds,
  });

  if (!result.success) {
    const minutes = Math.ceil(result.resetSeconds / 60);
    const defaultMsg = `ძალიან ბევრი მოთხოვნა. უსაფრთხოების მიზნით თქვენი მოთხოვნა დროებით შეზღუდულია. გთხოვთ სცადოთ ${minutes} წუთის შემდეგ.`;
    const message = options.customMessage || defaultMsg;

    // Record audit log for security monitoring
    await recordAuditLog({
      action: "AUTH_RATE_LIMIT_TRIGGERED",
      entity: "RateLimit",
      target: `${options.namespace} (${identifier})`,
      details: `Rate limit გადაჭარბებულია. ლიმიტი: ${options.limit} მოთხოვნა / ${Math.round(options.windowSeconds / 60)} წუთში. IP: ${clientIp}`,
      ipAddress: clientIp,
    });

    const response = NextResponse.json(
      {
        success: false,
        error: message,
        retryAfter: result.resetSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetSeconds * 1000) / 1000)),
        },
      }
    );

    return { success: false, response };
  }

  return { success: true };
}
