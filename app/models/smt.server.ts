import invariant from "tiny-invariant";
import { db } from "../db.server";

export type SMTree = {
  id: number;
  key: string; // unique identifier, like "collective:3"
  root: string; // Sparse Merkle Tree root hash
  nodes: string; // serialized merkle tree nodes
};

export const createSMTree = async (
  data: Pick<SMTree, "key">
): Promise<[any, SMTree | null]> => {
  const [res] = await db("smt").insert(data, ["id"]);
  invariant(res, "Create SMTree failed");
  return [undefined, { ...res }];
};

export const deleteSMTree = async (
  query: Partial<Pick<SMTree, "id" | "key">>
) => await db("smt").where(query).del();

export const updateSMTree = async (
  query: Partial<Pick<SMTree, "id" | "key">>,
  data: { root: string; nodes: string }
) => await db("smt").where(query).update(data);

export const getSMTree = async (
  query: Partial<SMTree>
): Promise<SMTree | null> => {
  const [res] = await db.select().from<SMTree>("smt").where(query);
  return res ? { ...res } : null;
};
