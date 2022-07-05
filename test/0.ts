import "mocha";
import * as dotenv from "dotenv";
import { assert } from "chai";

// ensure the test environment is set (before import db)
// works for all other tests when this test is first

/* eslint-disable import/first */
dotenv.config({ path: "./.test.env" });

describe("Test Environment", () => {
  it("Should have properly set NODE_ENV", () => {
    assert(process.env.NODE_ENV == "test");
  });
});
