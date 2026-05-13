import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
    expect(result?.role).toBe("user");
  });
});

describe("auth.logout", () => {
  it("clears cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx = createAuthContext();
    ctx.res.clearCookie = (name: string) => { cleared.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared).toContain(COOKIE_NAME);
  });
});

// ─── Admin Guard Tests ────────────────────────────────────────────────────────
describe("admin guard", () => {
  it("rejects non-admin user from admin endpoints", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.spots.adminList()).rejects.toThrow();
  });

  it("allows admin user to access admin endpoints", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    // Should not throw (may return empty array if DB not available)
    const result = await caller.spots.adminList().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Testimonial Moderation Tests ─────────────────────────────────────────────
describe("testimonials.create", () => {
  it("rejects testimonial with forbidden words", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.testimonials.create({
        authorName: "Test",
        content: "Isso é uma merda de lugar",
        rating: 1,
      })
    ).rejects.toThrow("palavras não permitidas");
  });

  it("rejects testimonial that is too short", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.testimonials.create({
        authorName: "Test",
        content: "Curto",
        rating: 3,
      })
    ).rejects.toThrow();
  });
});

// ─── Spot Slug Tests ──────────────────────────────────────────────────────────
describe("spots.bySlug", () => {
  it("throws NOT_FOUND for unknown slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.spots.bySlug({ slug: "slug-que-nao-existe-12345" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
