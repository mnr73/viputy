import { expect, it } from "vitest";
import { version } from "../src";

it("exports version", () => {
  expect(version).toMatch(/^1\./);
});
