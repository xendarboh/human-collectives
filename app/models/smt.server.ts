import invariant from "tiny-invariant";
import { db } from "../db.server";

export type SMTree = {
  id: number;
  type: string; // "group" like collective, poll, etc
  key: number; // unique identifier together with type
  root: string; // Sparse Merkle Tree root hash
  nodes: string; // serialized merkle tree nodes
};

export type SMTreeIdentifier =
  | Pick<SMTree, "id">
  | Pick<SMTree, "type" | "key">;

export const createSMTree = async (
  data: Pick<SMTree, "type" | "key">
): Promise<[any, SMTree | null]> => {
  const [res] = await db("smt").insert(data, ["id"]);
  invariant(res, "Create SMTree failed");
  return [undefined, { ...res }];
};

export const deleteSMTree = async (query: SMTreeIdentifier) =>
  await db("smt").where(query).del();

export const updateSMTree = async (
  query: SMTreeIdentifier,
  data: { root: string; nodes: string }
) => await db("smt").where(query).update(data);

export const getSMTree = async (
  query: SMTreeIdentifier,
  returning: Array<string> | undefined = []
): Promise<SMTree | null> => {
  const [res] = await db.select(returning).from<SMTree>("smt").where(query);
  return res ? { ...res } : null;
};
