import { expect } from "chai";
import { ethers } from "hardhat";

import type { BigNumberish } from "ethers";
import type { CollectiveVerifier } from "typechain";

// 2022-07-21 https://stackoverflow.com/questions/69085499/typescript-convert-tuple-type-to-object/70398429#70398429
type TupleToObject<T extends any[]> = Omit<T, keyof any[]>;
type TupleToObjectWithPropNames<
  T extends any[],
  N extends Record<keyof TupleToObject<T>, PropertyKey>
> = { [K in keyof TupleToObject<T> as N[K]]: T[K] };

export type VerificationInfo = TupleToObjectWithPropNames<
  Parameters<CollectiveVerifier["verifyProof"]>,
  ["a", "b", "c", "input", "overrides"]
>;

export interface Proof {
  proof: {
    pi_a: Array<BigNumberish>;
    pi_b: Array<Array<BigNumberish>>;
    pi_c: Array<BigNumberish>;
    protocol: string;
    curve: string;
  };
  publicSignals: [BigNumberish, BigNumberish, BigNumberish];
}

// Reference: 2022-07-20 https://github.com/iden3/contracts/blob/master/test/mtp/utils.ts
export function prepareInputs(json: Proof): VerificationInfo {
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
    // eslint-disable-next-line no-loop-func
    it(test.name, async () => {
      const { a, b, c, input } = prepareInputs(test.proofJSON);
      if (test.errorMessage) {
        (
          expect(verifier.verifyProof(a, b, c, input)).to.be as any
        ).revertedWith(test.errorMessage);
      } else {
        const verified = await verifier.verifyProof(a, b, c, input);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(verified).to.be.true;
      }
    });
  }
});
