import { expect } from "chai";
import { ethers } from "hardhat";

import type { CollectiveVerifier } from "typechain";

export interface VerificationInfo {
  inputs: Array<string>;
  pi_a: Array<string>;
  pi_b: Array<Array<string>>;
  pi_c: Array<string>;
}

// const x: CollectiveVerifier['verifyProof'] = null;

// export type VerificationInfo = CollectiveVerifier['verifyProof'];

// Reference: 2022-07-20 https://github.com/iden3/contracts/blob/master/test/mtp/utils.ts
export function prepareInputs(json: any): VerificationInfo {
  // export function prepareInputs(json: any): VerificationInfo {
  const { proof, publicSignals } = json;
  const { pi_a, pi_b, pi_c } = proof;
  const [[p1, p2], [p3, p4]] = pi_b;
  const preparedProof = {
    pi_a: pi_a.slice(0, 2),
    pi_b: [
      [p2, p1],
      [p4, p3],
    ],
    pi_c: pi_c.slice(0, 2),
  };

  return { inputs: publicSignals, ...preparedProof };
}

const tests = [
  {
    name: "Verify Proof: Collective inclusion is valid",
    proofJSON: require("../data/verify-collective-inclusion-valid.json"),
  },
  {
    name: "Verify Proof: Collective exclusion is valid",
    proofJSON: require("../data/verify-collective-exclusion-valid.json"),
  },
  {
    name: "Verify Proof: Collective inclusion is NOT valid",
    proofJSON: require("../data/verify-collective-inclusion-invalid.json"),
    errorMessage: "Collective inclusion proof could not be verified",
  },
  {
    name: "Verify Proof: Collective exclusion is NOT valid",
    proofJSON: require("../data/verify-collective-exclusion-invalid.json"),
    errorMessage: "Collective exclusion proof could not be verified",
  },
];

describe("Contract: CollectiveVerifier", function () {
  this.timeout(100000);
  let verifier: CollectiveVerifier;

  before(async () => {
    const Verifier = await ethers.getContractFactory("CollectiveVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(verifier.address).to.be.properAddress;
  });

  for (const test of tests) {
    it(test.name, async () => {
      const { inputs, pi_a, pi_b, pi_c } = prepareInputs(test.proofJSON);

      if (test.errorMessage) {
        (
          expect(verifier.verifyProof(pi_a, pi_b, pi_c, inputs)).to.be as any
        ).revertedWith(test.errorMessage);
      } else {
        const verified = await verifier.verifyProof(pi_a, pi_b, pi_c, inputs);
        // console.log("verified", verified);
        expect(verified).to.be.true;
      }
    });
  }
});
