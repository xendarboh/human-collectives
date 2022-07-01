import invariant from "tiny-invariant";

import type { QueryOptions } from "~/db.server";
import { db, defaultQueryOptions } from "~/db.server";

export interface Vote {
  id: number;
  userId: number;
  choiceId: number;
  created_at?: string;
}

export const createVote = async (
  data: any,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Pick<Vote, "id"> | null]> => {
  const errors = opts.validate ? validateVote(data) : undefined;
  if (errors) return [errors, null];

  const [{ id }] = await db("votes").insert(data, ["id"]);
  invariant(id, "Insert vote failed");

  return [undefined, { id }];
};

// delete votes by array of ids
export const deleteVotes = async (ids: Array<any>) => {
  await db("votes").whereIn("id", ids).del();
};

// higher-level function over createVote that adheres to poll voting policy
export const castPollVote = async (
  pollId: number,
  data: Omit<Vote, "id" | "created_at">,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Pick<Vote, "id"> | null]> => {
  const { userId } = data;

  // assume one-vote per poll (for now) and clear existing to re-cast the vote
  const votes = await getUserPollVote(userId, pollId);
  const ids: Array<number> = [];
  votes.map((x) => ids.push(x.id));
  await deleteVotes(ids);

  return await createVote(data, opts);
};

// SELECT votes.choiceId
// FROM votes
// LEFT JOIN choice2poll
// ON votes.choiceId = choice2poll.choiceId
// WHERE votes.userId = ?
// AND choice2poll.pollId = ?;
export const getUserPollVote = async (
  userId: number,
  pollId: number
): Promise<Array<Vote>> =>
  await db("votes")
    .select("votes.*")
    .leftJoin("choice2poll", "votes.choiceId", "=", "choice2poll.choiceId")
    .where("votes.userId", userId)
    .andWhere("choice2poll.pollId", pollId);

export const validateVote = (vote: any) => {
  if (!vote || !vote.userId || !vote.choiceId) return "vote data required";

  // TODO check and enorce poll voting policy

  return undefined;
};
