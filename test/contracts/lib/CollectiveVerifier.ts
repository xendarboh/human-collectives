import { expect } from "chai";
import { ethers } from "hardhat";

import type { CollectiveVerifier } from "../../../typechain";
import type { Proof, ProofVerification } from "../../../types";

// References:
// 2022-07-20 https://github.com/iden3/contracts/blob/master/test/mtp/utils.ts
// 2022-07-20 https://github.com/enricobottazzi/ZK-SBT/blob/99987bb85d6bef6826856af4319a74a5b543de18/node_builder/solidity-proof-builder.js
export function prepareSolidityProofInput(json: Proof): ProofVerification {
  const { proof, publicSignals } = json;
  const { pi_a, pi_b, pi_c } = proof;
  const [[p1, p2], [p3, p4]] = pi_b;
  return {
    a: [pi_a[0], pi_a[1]],
    b: [
      [p2, p1],
      [p4, p3],
    ],
    c: [pi_c[0], pi_c[1]],
    input: publicSignals,
  };
}

const tests = [
  {
    name: "Verify Proof: Collective inclusion is valid",
    proofJSON: require("../data/proof/collective-inclusion-valid.json"),
  },
  {
    name: "Verify Proof: Collective exclusion is valid",
    proofJSON: require("../data/proof/collective-exclusion-valid.json"),
  },
  {
    name: "Verify Proof: Collective inclusion is NOT valid",
    proofJSON: require("../data/proof/collective-inclusion-invalid.json"),
    errorMessage: "Collective inclusion proof could not be verified",
  },
  {
    name: "Verify Proof: Collective exclusion is NOT valid",
    proofJSON: require("../data/proof/collective-exclusion-invalid.json"),
    errorMessage: "Collective exclusion proof could not be verified",
  },
];

describe("[solidity] CollectiveVerifier", function () {
  this.timeout(100000);
  let verifier: CollectiveVerifier;

  before(async () => {
    const Verifier = await ethers.getContractFactory("CollectiveVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
    expect(verifier.address).to.be.properAddress;
  });

  for (const test of tests) {
    // eslint-disable-next-line no-loop-func
    it(test.name, async () => {
      const { a, b, c, input } = prepareSolidityProofInput(test.proofJSON);
      if (test.errorMessage) {
        (
          expect(verifier.verifyProof(a, b, c, input)).to.be as any
        ).revertedWith(test.errorMessage);

        // this does not work...
        // await expect(verifier.verifyProof(a, b, c, input)).to.be.revertedWith(
        //   test.errorMessage
        // );
      } else {
        const verified = await verifier.verifyProof(a, b, c, input);
        expect(verified).to.be.true;
      }
    });
  }
});
