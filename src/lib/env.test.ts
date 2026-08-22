import { afterEach, describe, expect, test } from "bun:test";
import { requiredEnv, requiredHttpUrl } from "./env";

const originalValue = process.env.TEST_REQUIRED_ENV;

afterEach(() => {
  if (originalValue === undefined) delete process.env.TEST_REQUIRED_ENV;
  else process.env.TEST_REQUIRED_ENV = originalValue;
});

describe("required environment", () => {
  test("rejects missing and development placeholder values", () => {
    delete process.env.TEST_REQUIRED_ENV;
    expect(() => requiredEnv("TEST_REQUIRED_ENV")).toThrow();
    process.env.TEST_REQUIRED_ENV = "dev-key";
    expect(() => requiredEnv("TEST_REQUIRED_ENV")).toThrow();
  });

  test("accepts configured secrets and validates HTTP URLs", () => {
    process.env.TEST_REQUIRED_ENV = "a-real-secret";
    expect(requiredEnv("TEST_REQUIRED_ENV")).toBe("a-real-secret");
    process.env.TEST_REQUIRED_ENV = "https://example.com/";
    expect(requiredHttpUrl("TEST_REQUIRED_ENV")).toBe("https://example.com");
    process.env.TEST_REQUIRED_ENV = "file:///tmp/test";
    expect(() => requiredHttpUrl("TEST_REQUIRED_ENV")).toThrow();
  });
});
