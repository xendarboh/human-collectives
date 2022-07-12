import "mocha";
import * as snarkjs from "snarkjs";
import fs from "fs";
import { assert } from "chai";

import { deleteSMTree, getSMTree } from "../app/models/smt.server";
import {
  generateSMTreeExclusionWitnessInput,
  generateSMTreeInclusionWitnessInput,
  newSMTree,
  saveSMTree,
} from "../app/utils/smt.server";

let tree: any;
const id = { type: "test-proof", key: 100 };
const k1 = 111;
const v1 = 222;
const k2 = 333;
const v2 = 444;
const k3 = 555;
const v3 = 666;

const DIR_ASSETS = "public";

describe("Generate & Verify Proof of Collective", function () {
  this.timeout(7500);

  it("Setup test data", async () => {
    tree = await newSMTree();
    await tree.insert(k1, v1);
    await tree.insert(k2, v2);
    await tree.insert(k3, v3);
    await saveSMTree(id, tree.db);
    const res = await getSMTree(id);
    assert.notEqual(res, null);
  });

  it("Should generate and validate proof of collective inclusion", async () => {
    const key = k1; // find this!

    // generate the zkSNARK witness input
    const input = await generateSMTreeInclusionWitnessInput(id, key, 10);
    assert.notEqual(input, null);

    // genreate a proof of inclusion
    // NOTE: this causes mocha test to hang (maybe unclosed fs streams?)
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      DIR_ASSETS + "/zk/collective-verifier/circuit.wasm",
      DIR_ASSETS + "/zk/collective-verifier/circuit_final.zkey"
    );

    // verify the proof
    const vKeyFile =
      DIR_ASSETS + "/zk/collective-verifier/verification_key.json";
    const vKey = JSON.parse(fs.readFileSync(vKeyFile).toString());
    const verify = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    assert.equal(verify, true);
  });

  it("Should generate and validate proof of collective exclusion", async () => {
    const key = 999999999; // do not find this!

    // generate the zkSNARK witness input
    const input = await generateSMTreeExclusionWitnessInput(id, key, 10);
    assert.notEqual(input, null);

    // genreate a proof of exclusion
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      DIR_ASSETS + "/zk/collective-verifier/circuit.wasm",
      DIR_ASSETS + "/zk/collective-verifier/circuit_final.zkey"
    );

    // verify the proof
    const vKeyFile =
      DIR_ASSETS + "/zk/collective-verifier/verification_key.json";
    const vKey = JSON.parse(fs.readFileSync(vKeyFile).toString());
    const verif = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    assert.equal(verif, true);
  });

  it("Cleanup test data", async () => {
    await deleteSMTree(id);
    const res = await getSMTree(id);
    // await db.destroy(); // not needed with `mocha --exit`
    assert.equal(res, null);
  });
});
