import assert from "node:assert/strict";
import test from "node:test";
import { addCalendarYears } from "../src/domain/temporal";

test("addCalendarYears keeps the corresponding calendar date", () => {
  assert.equal(addCalendarYears("2020-01-15", 10), "2030-01-15");
  assert.equal(addCalendarYears("2020-12-31", 3), "2023-12-31");
});

test("addCalendarYears uses the final day when a leap-day counterpart does not exist", () => {
  assert.equal(addCalendarYears("2020-02-29", 30), "2050-02-28");
  assert.equal(addCalendarYears("2020-02-29", 4), "2024-02-29");
});

test("addCalendarYears rejects impossible dates", () => {
  assert.throws(() => addCalendarYears("2023-02-29", 3), /không tồn tại/u);
});
