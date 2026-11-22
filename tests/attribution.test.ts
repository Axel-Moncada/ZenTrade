import { describe, expect, it } from "vitest";
import { nextAttribution, parseAttribution, serializeAttribution } from "@/lib/analytics/attribution";

const q = (s: string) => new URLSearchParams(s);

describe("nextAttribution (first-touch)", () => {
  it("guarda UTM, gclid, página y país en la primera visita pagada", () => {
    const a = nextAttribution(null, q("utm_source=google&utm_medium=cpc&utm_term=prop%20firm%20trading%20journal&gclid=TEST123"), "/", "US");
    expect(a).toMatchObject({ utm_source: "google", utm_medium: "cpc", utm_term: "prop firm trading journal", gclid: "TEST123", landing_path: "/", country: "US" });
  });

  it("no pisa la atribución existente con otra visita orgánica o con UTM sin click ID", () => {
    const first = nextAttribution(null, q("utm_source=google&gclid=A"), "/", "US");
    expect(nextAttribution(first, q(""), "/pricing", "US")).toBeNull();
    expect(nextAttribution(first, q("utm_source=newsletter"), "/blog", "US")).toBeNull();
  });

  it("un gclid o fbclid nuevo reemplaza la atribución (nuevo clic pagado)", () => {
    const first = nextAttribution(null, q("utm_source=google&gclid=A"), "/", "US");
    const next = nextAttribution(first, q("utm_source=facebook&fbclid=F1"), "/vs/tradezella", "US");
    expect(next).toMatchObject({ utm_source: "facebook", fbclid: "F1", landing_path: "/vs/tradezella" });
    expect(next?.gclid).toBeUndefined();
    expect(nextAttribution(first, q("gclid=A"), "/", "US")).toBeNull();
  });

  it("guarda país y página de entrada en tráfico directo; ignora países inválidos", () => {
    expect(nextAttribution(null, q(""), "/", "CO")).toMatchObject({ country: "CO", landing_path: "/" });
    expect(nextAttribution(null, q(""), "/", null)).toBeNull();
    expect(nextAttribution(null, q("utm_source=x"), "/", "XX1")?.country).toBeUndefined();
  });

  it("serializa y parsea la cookie; descarta basura", () => {
    const a = nextAttribution(null, q("utm_campaign=launch"), "/", "US")!;
    expect(parseAttribution(serializeAttribution(a))).toEqual(a);
    expect(parseAttribution("not-json")).toBeNull();
    expect(parseAttribution(encodeURIComponent(JSON.stringify({ utm_source: "x".repeat(500) })))).toBeNull();
  });
});
