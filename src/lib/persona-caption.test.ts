import { describe, expect, test } from "bun:test";
import { buildPersonaCaptionContext, extractPersonaCaption } from "./persona-caption";

describe("persona caption", () => {
  test("builds bounded post context from group and persona inputs", () => {
    const context = buildPersonaCaptionContext({
      personaId: "persona-1",
      groupName: "Gadget Hemat",
      niche: "review gadget",
      topic: `Power bank\u0000${"x".repeat(2500)}`,
      affiliateLink: "https://example.com/product",
    });

    expect(context).toContain("Grup tujuan: Gadget Hemat");
    expect(context).toContain("Niche grup: review gadget");
    expect(context).toContain("Link affiliate: https://example.com/product");
    expect(context).not.toContain("\u0000");
    expect(context.length).toBeLessThan(3700);
  });

  test("extracts only a valid first caption", () => {
    expect(extractPersonaCaption({ captions: ["  Siap posting!  "] })).toBe("Siap posting!");
    expect(extractPersonaCaption({ captions: [] })).toBe("");
    expect(extractPersonaCaption({ captions: "invalid" })).toBe("");
  });
});
