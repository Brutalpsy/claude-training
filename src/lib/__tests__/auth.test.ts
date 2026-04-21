// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(payload: Record<string, unknown>, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("getSession returns null when no cookie exists", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).toBeNull();
  expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
});

test("getSession returns session payload for valid token", async () => {
  const token = await makeToken({
    userId: "user-123",
    email: "test@example.com",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  });
  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-123");
  expect(session!.email).toBe("test@example.com");
});

test("getSession returns null for expired token", async () => {
  const token = await makeToken(
    { userId: "user-123", email: "test@example.com" },
    "0s"
  );
  await new Promise((r) => setTimeout(r, 1100));
  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for tampered token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not-a-valid-jwt" });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).toBeNull();
});
