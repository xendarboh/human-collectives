import invariant from "tiny-invariant";

import type { Collective } from "~/models/collective.server";
import type { QueryOptions } from "~/db.server";
import { db, defaultQueryOptions } from "~/db.server";
import { hashCode, restoreSMTree, saveSMTree } from "~/utils/smt.server";

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

export const isCollectiveMember = async (
  collective: Collective,
  userId: number
): Promise<boolean> => {
  const [res] = await db("members")
    .select(["userId"])
    .where({ userId, collectiveId: collective.id });
  return res ? true : false;
};

// get the collectives that the given user is a member of
// SELECT collectives.*
// FROM collectives
// LEFT JOIN members
// on collectives.id = members.collectiveId
// WHERE members.userId = ?;
export const getMemberCollectives = async (
  userId: number
): Promise<Array<Collective>> =>
  await db("collectives")
    .select([
      "collectives.id",
      "collectives.title",
      "collectives.description",
      "collectives.creator",
      "collectives.created_at",
    ])
    .leftJoin("members", "collectives.id", "=", "members.collectiveId")
    .where({ userId });

// get the members of the given collective
export const getCollectiveMembers = async (
  collectiveId: number
): Promise<Array<Omit<Member, "collectiveId">>> =>
  await db("members").select(["userId", "created_at"]).where({ collectiveId });

export const deleteCollectiveMembers = async (collectiveId: number) =>
  await db("members").where({ collectiveId }).del();

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

  // add member to the collective's SMT
  const treeId = { type: "collective", key: collective.id };
  const tree = await restoreSMTree(treeId);
  await tree.insert(userId, hashCode("something?")); // TODO use humanode identifier vs userId
  await saveSMTree(treeId, tree.db);

  return [undefined, member];
};

export const leaveCollective = async (collectiveId: number, userId: number) => {
  await db("members").where({ userId, collectiveId }).del();

  // remove member from the collective's SMT
  const treeId = { type: "collective", key: collectiveId };
  const tree = await restoreSMTree(treeId);
  const search = await tree.find(userId);
  invariant(search.found === true, "Member not found in collective's SMT");
  await tree.delete(userId); // TODO use humanode identifier vs userId
  await saveSMTree(treeId, tree.db);
};

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
