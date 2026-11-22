import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: {} }));

beforeAll(() => {
  process.env.EMAIL_UNSUBSCRIBE_SECRET = "test-secret-for-unsubscribe-tokens";
});

describe("unsubscribe tokens", () => {
  it("valida el token del mismo email (sin importar mayúsculas) y rechaza otros", async () => {
    const { unsubscribeToken, verifyUnsubscribeToken, unsubscribeUrl } = await import("@/lib/email/unsubscribe");
    const token = unsubscribeToken("Trader@Example.com");
    expect(verifyUnsubscribeToken("trader@example.com", token)).toBe(true);
    expect(verifyUnsubscribeToken("other@example.com", token)).toBe(false);
    expect(verifyUnsubscribeToken("trader@example.com", "x".repeat(token.length))).toBe(false);
    expect(verifyUnsubscribeToken("trader@example.com", "short")).toBe(false);
    expect(unsubscribeUrl("Trader@Example.com")).toContain("e=trader%40example.com");
  });
});
