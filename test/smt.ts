import "mocha";
import { assert } from "chai";

import { db } from "../app/db.server";
import { deleteSMTree, getSMTree } from "../app/models/smt.server";
import {
  arr2hex,
  newSMTree,
  restoreSMTree,
  saveSMTree,
} from "../app/utils/smt.server";

const key = "test:1";
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
    tree1 = await newSMTree();
    await tree1.insert(k1, v1);
    await tree1.insert(k2, v2);
    assert.notEqual(arr2hex(tree1.root), zero);
  });

  it("Should find a key in the tree", async () => {
    let r = await tree1.find(k1);
    assert.equal(r.found, true);
  });

  it("Should save the tree", async () => {
    await saveSMTree(key, tree1.db);
    const res = await getSMTree({ key });
    assert.notEqual(res, null);
  });

  it("Should restore the tree", async () => {
    tree2 = await restoreSMTree(key);
    assert.equal(arr2hex(tree1.root), arr2hex(tree2.root));
  });

  it("Should find a key in the restored tree", async () => {
    let r = await tree2.find(k1);
    assert.equal(r.found, true);
  });

  it("Should restore a tree, add to it, then save it", async () => {
    tree1 = await restoreSMTree(key);
    await tree1.insert(k3, v3);
    await saveSMTree(key, tree1.db);
  });

  it("Should remove the tree and clean up", async () => {
    await deleteSMTree({ key });
    const res = await getSMTree({ key });
    await db.destroy();
    assert.equal(res, null);
  });
});
