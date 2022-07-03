import invariant from "tiny-invariant";
import { customAlphabet } from "nanoid";

import type { Member } from "~/models/member.server";
import type { QueryOptions } from "~/db.server";
import { db, defaultQueryOptions } from "~/db.server";
import {
  deleteCollectiveMembers,
  getCollectiveMembers,
} from "~/models/member.server";

export type Collective = {
  id: number;
  title: string;
  description: string;
  creator: number; // id of the user that created the collective
  accessCode: string; // code enabling members to join the collective
  created_at?: string;
  members?: Array<Omit<Member, "collectiveId">>;
};

// export type poll2collective = {
//   pollId: number;
//   collectiveId: number;
// };

export const createCollective = async (
  data: any,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Pick<Collective, "id"> | null]> => {
  const errors = opts.validate ? validateCollective(data) : undefined;
  if (errors) return [errors, null];

  const values = { accessCode: generateCollectiveAccessCode(), ...data };
  const [{ id }] = await db("collectives").insert(values, ["id"]);
  invariant(id, "Insert collective failed");

  return [undefined, { id }];
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
  return {
    ...res,
    members: await getCollectiveMembers(res.id),
  };
};

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