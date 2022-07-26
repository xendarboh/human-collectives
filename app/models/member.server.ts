import invariant from "tiny-invariant";

import type { Collective } from "~/models/collective.server";
import type { QueryOptions } from "~/db.server";
import { db, defaultQueryOptions } from "~/db.server";
import {
  hashCode,
  prepareSMTKey,
  restoreSMTree,
  saveSMTree,
} from "~/utils/smt.server";
import { createUser, getUser } from "./user.server";

export interface Member {
  userId: number;
  collectiveId: number;
  created_at?: string;
  // role: string;
}

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
  authId: string,
  data: any,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Member | null]> => {
  const errors = opts.validate
    ? await validateJoinCollective({ userId, ...data })
    : undefined;
  if (errors) return [errors, null];

  // discern which collective to join from the given accessCode
  const [collective] = await db
    .select("id")
    .from<Collective>("collectives")
    .where({ accessCode: data.accessCode });
  invariant(collective, "Join collective failed");

  const [errors2, member] = await _collectiveMembershipAdd(
    collective.id,
    userId,
    authId
  );
  return [errors2, member];
};

export const leaveCollective = async (
  collectiveId: number,
  userId: number,
  authId: string
) => await _collectiveMembershipRemove(collectiveId, userId, authId);

// Note: this function assumes collective exists for the given collectiveId
export const collectiveAddMember = async (
  collectiveId: number,
  data: { authId: string },
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Member | null]> => {
  const errors = opts.validate
    ? await validateCollectiveAddMember(data)
    : undefined;
  if (errors) return [errors, null];

  const { authId } = data;

  // retreive user from database if it exists
  // create user in database if does not exist, to "register" the user
  // ensure user exists
  let user = await getUser({ bioid: authId });
  if (!user) user = await createUser({ bioid: authId });
  invariant(user, "User Registration Failed");

  const [errors2, member] = await _collectiveMembershipAdd(
    collectiveId,
    user.id,
    authId
  );
  return [errors2, member];
};

// Note: this function assumes collective exists for the given collectiveId
export const collectiveRemoveMember = async (
  collectiveId: number,
  data: { authId: string },
  opts: QueryOptions = defaultQueryOptions
): Promise<[any]> => {
  const errors = opts.validate
    ? await validateCollectiveRemoveMember(data)
    : undefined;
  if (errors) return [errors];

  const { authId } = data;

  // retreive user from database if it exists
  let user = await getUser({ bioid: authId });
  invariant(user, "User Not Found");

  await _collectiveMembershipRemove(collectiveId, user.id, authId);
  return [undefined];
};

export const validateJoinCollective = async (data: any) => {
  const errors = {
    accessCode: await validateJoinCollectiveAccessCode(data),
  };
  return Object.values(errors).some(Boolean) ? errors : undefined;
};

export const validateCollectiveAddMember = async (data: any) => {
  const errors = {
    authId: await validateCollectiveMemberAuthId(data),
  };
  return Object.values(errors).some(Boolean) ? errors : undefined;
};

export const validateCollectiveRemoveMember = async (data: any) =>
  await validateCollectiveAddMember(data);

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
  if (member) return "Already a member of that collective";

  return undefined;
};

const authIdMinLength = 8; // TODO: this is made up and could be more legit or use regexp
export const validateCollectiveMemberAuthId = async (data: any) => {
  const { authId } = data;
  if (typeof authId !== "string" || authId.length === 0)
    return "HUMΔNODE Identifier is Required";

  if (authId.length <= authIdMinLength)
    return "HUMΔNODE Identifier Invalid Format";

  return undefined;
};

// create collective membership (in database)
// and add to collective's SMT
export const _collectiveMembershipAdd = async (
  collectiveId: number,
  userId: number,
  authId: string
): Promise<[any, Member | null]> => {
  const [errors, member] = await createMember({
    userId,
    collectiveId,
  });
  if (errors) return [errors, null];
  invariant(member, "Create Member Failed");

  // add member's biometric-identifier to the collective's SMT
  const treeId = { type: "collective", key: collectiveId };
  const tree = await restoreSMTree(treeId);
  const key = prepareSMTKey(authId);
  const value = hashCode("something?"); // TODO
  await tree.insert(key, value);
  await saveSMTree(treeId, tree.db);

  return [undefined, member];
};

// remove collective membership (in database)
// and remove from collective's SMT
export const _collectiveMembershipRemove = async (
  collectiveId: number,
  userId: number,
  authId: string
) => {
  await db("members").where({ userId, collectiveId }).del();

  // remove member from the collective's SMT
  const treeId = { type: "collective", key: collectiveId };
  const tree = await restoreSMTree(treeId);
  const key = prepareSMTKey(authId);
  const search = await tree.find(key);
  invariant(search.found === true, "Member not found in collective's SMT");
  await tree.delete(key);
  await saveSMTree(treeId, tree.db);
};
