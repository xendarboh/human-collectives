import invariant from "tiny-invariant";
import { customAlphabet, nanoid } from "nanoid";

import type { Member } from "~/models/member.server";
import type { QueryOptions } from "~/db.server";
import { db, defaultQueryOptions } from "~/db.server";
import { getSMTree } from "./smt.server";
import { hashCode, newSMTree, saveSMTree } from "~/utils/smt.server";
import {
  deleteCollectiveMembers,
  getCollectiveMembers,
} from "~/models/member.server";

export interface Collective {
  id: number;
  title: string;
  description: string;
  creator: number; // id of the user that created the collective
  accessCode: string; // code enabling members to join the collective
  isOpenAccess: boolean; // members can register without accessCode?
  isPublic: boolean; // visible to all? (or only members)
  created_at?: string;
  members?: Array<Omit<Member, "collectiveId">>;
  merkleRoot?: string;
}

export const createCollective = async (
  data: any,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Pick<Collective, "id"> | null]> => {
  const errors = opts.validate ? validateCollective(data) : undefined;
  if (errors) return [errors, null];

  const values = { accessCode: generateCollectiveAccessCode(), ...data };
  const [{ id }] = await db("collectives").insert(values, ["id"]);
  invariant(id, "Insert collective failed");

  await initCollective(id);

  return [undefined, { id }];
};

// create an SMT for the collective
// insert something random to initialize its root to non-zero
export const initCollective = async (id: number) => {
  const type = "collective";
  const key = id;
  const tree = await newSMTree();
  await tree.insert(hashCode(type + key), hashCode(nanoid()));
  await saveSMTree({ type, key }, tree.db);
  const res = await getSMTree({ type, key });
  invariant(res, "Failed to create collective's merkle tree");
};

export const updateCollective = async (
  id: number,
  data: Partial<Collective>,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Collective | null]> => {
  const errors = opts.validate ? validateCollective(data) : undefined;
  if (errors) return [errors, null];

  await db("collectives").where({ id }).update(data);

  return [errors, await getCollective({ id })];
};

export const deleteCollective = async (id: number) => {
  await db("collectives").where({ id }).del();
  await deleteCollectiveMembers(id);
};

export const getCollectives = async (
  query: Partial<Collective> | undefined = {}
): Promise<Collective[]> =>
  await db.select().from<Collective>("collectives").where(query);

export const getCollective = async (
  query: Pick<Collective, "id">
): Promise<Collective | null> => {
  const [res] = await db.select().from<Collective>("collectives").where(query);
  if (!res) return null;
  const smt = await getSMTree({ type: "collective", key: res.id }, ["root"]);
  return {
    ...res,
    members: await getCollectiveMembers(res.id),
    merkleRoot: smt?.root,
  };
};

export const getCreatorCollectives = async (
  userId: number
): Promise<Collective[]> => await getCollectives({ creator: userId });

export const isCollectiveCreator = (
  collective: Collective,
  userId: number
): boolean => collective.creator === userId;

export const generateCollectiveAccessCode = (): Collective["accessCode"] => {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 12);
  return nanoid();
};

export const validateCollective = (data: any) => {
  const errors = {
    title: validateCollectiveTitle(data.title),
    description: validateCollectiveDescription(data.description),
  };
  return Object.values(errors).some(Boolean) ? errors : undefined;
};

export const validateCollectiveTitle = (x: any) =>
  typeof x !== "string" || x.length === 0 ? "Title is required" : undefined;

export const validateCollectiveDescription = (x: any) =>
  typeof x !== "string" || x.length === 0
    ? "Description is required"
    : undefined;
