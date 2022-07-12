import * as snarkjs from "snarkjs";
import fs from "fs";

import {
  generateSMTreeExclusionWitnessInput,
  generateSMTreeInclusionWitnessInput,
} from "~/utils/smt.server";

export interface Proof {
  proof: any;
  publicSignals: any;
}

export interface ProofVerification {
  isValid: boolean;
  publicSignals: any;
}

export interface ProofOfCollective extends Proof {}

export interface ProofOfCollectiveVerification extends ProofVerification {
  publicSignals: {
    fnc: number;
    root: string;
  };
}

// these correspond to collective-verifier.circom fnc public input signal
const VERIFY_INCLUSION = 0;
const VERIFY_EXCLUSION = 1;

// number of collective-verifier.circom public inputs
const NUM_PUBLIC_INPUTS = 3;

// location of public assets (served through http(s))
const DIR_ASSETS = "public"; // TODO abstract

export const getProofOfCollectiveInclusion = async (
  collectiveId: number,
  userId: number
): Promise<ProofOfCollective | null> => {
  const treeId = { type: "collective", key: collectiveId };
  const key = userId;
  const input = await generateSMTreeInclusionWitnessInput(treeId, key);
  if (!input) return null;

  return await snarkjs.groth16.fullProve(
    input,
    DIR_ASSETS + "/zk/collective-verifier/circuit.wasm",
    DIR_ASSETS + "/zk/collective-verifier/circuit_final.zkey"
  );
};

export const getProofOfCollectiveExclusion = async (
  collectiveId: number,
  userId: number
): Promise<ProofOfCollective | null> => {
  const treeId = { type: "collective", key: collectiveId };
  const key = userId;
  const input = await generateSMTreeExclusionWitnessInput(treeId, key);
  if (!input) return null;

  return await snarkjs.groth16.fullProve(
    input,
    DIR_ASSETS + "/zk/collective-verifier/circuit.wasm",
    DIR_ASSETS + "/zk/collective-verifier/circuit_final.zkey"
  );
};

export const verifyProofOfCollective = async (
  toVerify: ProofOfCollective
): Promise<ProofOfCollectiveVerification> => {
  const { publicSignals, proof } = toVerify;

  const _publicSignals = {
    fnc: +publicSignals[2],
    root: publicSignals[1],
  };

  if (!validateProofVerification(toVerify))
    return { isValid: false, publicSignals: _publicSignals };

  const vKeyFile = DIR_ASSETS + "/zk/collective-verifier/verification_key.json";
  const vKey = JSON.parse(fs.readFileSync(vKeyFile).toString());
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  return {
    isValid,
    publicSignals: _publicSignals,
  };
};

// rudimentary pre-validation of proof verfication
export const validateProofVerification = (toVerify: ProofOfCollective) => {
  if (
    typeof toVerify.publicSignals !== "object" ||
    toVerify.publicSignals.length !== NUM_PUBLIC_INPUTS
  ) {
    return "invalid publicSignals";
  }

  if (
    +toVerify.publicSignals[2] !== VERIFY_EXCLUSION ||
    +toVerify.publicSignals[2] !== VERIFY_INCLUSION
  ) {
    return "invalid publicSignals";
  }

  if (typeof toVerify.proof !== "string" || toVerify.proof.length === 0) {
    return "invalid proof";
  }

  return undefined;
};
