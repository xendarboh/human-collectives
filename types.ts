import type { BigNumberish } from "ethers";

import type { CollectiveVerifier } from "./typechain";

// https://stackoverflow.com/questions/69085499/typescript-convert-tuple-type-to-object/70398429#70398429
type TupleToObject<T extends any[]> = Omit<T, keyof any[]>;
type TupleToObjectWithPropNames<
  T extends any[],
  N extends Record<keyof TupleToObject<T>, PropertyKey>
> = { [K in keyof TupleToObject<T> as N[K]]: T[K] };

// create object from typechain-generated function parameter types
export type ProofVerification = TupleToObjectWithPropNames<
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
