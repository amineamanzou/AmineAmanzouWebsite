import assert from "node:assert/strict";
import test from "node:test";
import { publicationPairErrors } from "../scripts/checks/publication-policy.mjs";

const pair = (fr, en) => [{ publishedAt: fr }, { publishedAt: en }];
test("translations must launch together after the policy starts", () => {
  assert.equal(publicationPairErrors(pair("2026-09-29", "2026-10-01")).length, 1);
  assert.deepEqual(publicationPairErrors(pair("2026-09-29", "2026-09-29")), []);
});
test("historical dates remain truthful", () => {
  assert.deepEqual(publicationPairErrors(pair("2026-07-06", "2026-07-07")), []);
});
test("a pair straddling the policy date cannot bypass the rule", () => {
  assert.equal(publicationPairErrors(pair("2026-09-25", "2026-09-28")).length, 1);
  assert.equal(publicationPairErrors(pair("2026-09-28", undefined)).length, 1);
});
