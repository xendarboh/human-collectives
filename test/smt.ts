import "mocha";
import { assert } from "chai";

import { deleteSMTree, getSMTree } from "../app/models/smt.server";
import {
  arr2hex,
  hashCode,
  newSMTree,
  restoreSMTree,
  saveSMTree,
} from "../app/utils/smt.server";

const id = { type: "test", key: 1 };
let tree1: any;
let tree2: any;
const k1 = 111;
const v1 = 222;
const k2 = 333;
const v2 = 444;
const k3 = 555;
const v3 = 666;
const zero = "0000000000000000000000000000000000000000000000000000000000000000";

// Tests are broken down sequentially to additionally understand their execution time

describe("SMT Save & Restore", function () {
  this.timeout(7500);

  it("Should create a new tree", async () => {
    tree1 = await newSMTree();
    assert.equal(arr2hex(tree1.root), zero);
  });

  it("Should add to the tree", async () => {
    await tree1.insert(k1, v1);
    await tree1.insert(k2, v2);
    assert.notEqual(arr2hex(tree1.root), zero);
  });

  it("Should add encoded strings to the tree", async () => {
    const kx = "collective:1";
    const vx = "sere4hv3h343";
    await tree1.insert(hashCode(kx), hashCode(vx));
    assert.notEqual(arr2hex(tree1.root), zero);
  });

  it("Should find a key in the tree", async () => {
    let r = await tree1.find(k1);
    assert.equal(r.found, true);
  });

  it("Should save the tree", async () => {
    await saveSMTree(id, tree1.db);
    const res = await getSMTree(id);
    assert.notEqual(res, null);
  });

  it("Should restore the tree", async () => {
    tree2 = await restoreSMTree(id);
    assert.equal(arr2hex(tree1.root), arr2hex(tree2.root));
  });

  it("Should find a key in the restored tree", async () => {
    let r = await tree2.find(k1);
    assert.equal(r.found, true);
  });

  it("Should restore a tree, add to it, then save it", async () => {
    tree1 = await restoreSMTree(id);
    await tree1.insert(k3, v3);
    await saveSMTree(id, tree1.db);
  });

  it("Should remove the tree and clean up", async () => {
    await deleteSMTree(id);
    const res = await getSMTree(id);
    // await db.destroy(); // not needed with `mocha --exit`
    assert.equal(res, null);
  });
});

describe("SMT Utils", function () {
  it("Should use unique determistic string to number hashing", async () => {
    const x = "someString1234";
    const y = "someString12345";
    const a = hashCode(x);
    const b = hashCode(x);
    const c = hashCode(y);
    assert.equal(a, b);
    assert.notEqual(b, c);
  });
});
