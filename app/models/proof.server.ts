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

export interface ProofOfCollective extends Proof {}

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
): Promise<boolean> => {
  const { publicSignals, proof } = toVerify;

  const vKeyFile = DIR_ASSETS + "/zk/collective-verifier/verification_key.json";
  const vKey = JSON.parse(fs.readFileSync(vKeyFile).toString());
  return await snarkjs.groth16.verify(vKey, publicSignals, proof);
};
