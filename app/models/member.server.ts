import invariant from "tiny-invariant";

import type { Collective } from "~/models/collective.server";
import type { QueryOptions } from "~/db.server";
import { db, defaultQueryOptions } from "~/db.server";

export type Member = {
  userId: number;
  collectiveId: number;
  created_at?: string;
  // role: string;
};

export const createMember = async (
  data: any,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Member | null]> => {
  const errors = opts.validate ? validateMember(data) : undefined;
  if (errors) return [errors, null];

  // insert new member and receive the id
  const [res] = await db("members").insert(data, ["userId"]);
  invariant(res, "Insert member failed");

  // fetch and return the member (to get its created_at column)
  const { userId, collectiveId } = data;
  return [errors, await getMember({ userId, collectiveId })];
};

export const getMember = async (
  query: Pick<Member, "userId" | "collectiveId">
): Promise<Member | null> => {
  const [res] = await db.select().from<Member>("members").where(query);
  if (!res) return null;
  return res;
};

export const validateMember = (x: any) => {
  if (!x || !x.userId || !x.collectiveId) return "member data required";
  return undefined;
};

export const joinCollective = async (
  userId: number,
  data: any,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Member | null]> => {
  const errors = opts.validate
    ? await validateJoinCollective({ userId, ...data })
    : undefined;
  if (errors) return [errors, null];

  const [collective] = await db
    .select("id")
    .from<Collective>("collectives")
    .where({ accessCode: data.accessCode });
  invariant(collective, "Join collective failed");

  const [errors2, member] = await createMember({
    userId,
    collectiveId: collective.id,
  });
  if (errors2) return [errors2, null];
  invariant(member, "Join collective failed");

  return [undefined, member];
};

// TODO export const leaveCollective

export const validateJoinCollective = async (data: any) => {
  const errors = {
    accessCode: await validateJoinCollectiveAccessCode(data),
  };
  return Object.values(errors).some(Boolean) ? errors : undefined;
};

export const validateJoinCollectiveAccessCode = async (data: any) => {
  const { userId, accessCode } = data;
  if (typeof accessCode !== "string" || accessCode.length === 0)
    return "Access code required";

  // ensure existance of collective with the given access code
  const [collective] = await db
    .select("id")
    .from<Collective>("collectives")
    .where({ accessCode });
  if (!collective) return "Invalid Access Code";

  // ensure user is not already a member of the collective
  const member = await getMember({ userId, collectiveId: collective.id });
  console.log("res", member);
  if (member) return "Already a member of that collective";

  return undefined;
};
