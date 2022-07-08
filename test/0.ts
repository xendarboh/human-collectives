import "mocha";
import { assert } from "chai";

describe("Test Environment", () => {
  it("Should have properly set NODE_ENV", () => {
    assert(process.env.NODE_ENV == "test");
  });
});
