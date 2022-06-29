import { db } from "~/db.server";

export interface Poll {
  id: number;
  title: string;
  body: string;
  creator: number;
  isPublished: boolean;
}

export interface PollQueryOptions {
  validate: boolean;
}

export const defaultQueryOpts: PollQueryOptions = {
  validate: true,
};

export const createPoll = async (
  data: any,
  opts: PollQueryOptions = defaultQueryOpts
): Promise<[any, Poll | null]> => {
  const errors = opts.validate ? validatePoll(data) : undefined;
  if (errors) return [errors, null];

  // insert new poll and receive the id
  const res = await db.insert(data, ["id"]).into("polls");
  if (!res.length) return [errors, null];

  // with the id, retrieve and return all columns
  return [errors, await getPoll({ id: res[0].id })];
};

export const updatePoll = async (
  id: number,
  data: any,
  opts: PollQueryOptions = defaultQueryOpts
): Promise<[any, Poll | null]> => {
  const errors = opts.validate ? validatePoll(data) : undefined;
  if (errors) return [errors, null];

  await db("polls").where({ id }).update(data);
  return [errors, await getPoll({ id })];
};

export const deletePoll = async (query: Pick<Poll, "id" | "creator">) =>
  await db("polls").where(query).del();

export const getPolls = async (
  query: Partial<Poll> | undefined = {}
): Promise<Poll[]> => await db.select().from<Poll>("polls").where(query);

export const getPoll = async (
  query: Pick<Poll, "id">
): Promise<Poll | null> => {
  const res = await db.select().from<Poll>("polls").where(query);
  return !res.length ? null : res[0];
};

export const isPollCreator = (poll: Poll, userID: number): boolean =>
  poll.creator === userID;

export const validatePoll = (data: any) => {
  const errors = {
    title: validatePollTitle(data.title),
    body: validatePollBody(data.body),
  };
  return Object.values(errors).some(Boolean) ? errors : undefined;
};

export const validatePollTitle = (title: any) =>
  typeof title !== "string" || title.length === 0
    ? "Title is required"
    : undefined;

export const validatePollBody = (body: any) =>
  typeof body !== "string" || body.length === 0
    ? "Body is required"
    : undefined;
