import { db } from "~/db.server";

export type Poll = {
  id: number;
  title: string;
  body: string;
  creator: number;
};

export const createPoll = async (data: any): Promise<[any, Poll | null]> => {
  const errors = validatePoll(data);
  if (errors) return [errors, null];

  const res = await db.insert(data, ["id"]).into("polls");
  return [undefined, !res.length ? null : res[0]];
};

export const updatePoll = async (id: number, data: any): Promise<[any]> => {
  const errors = validatePoll(data);
  if (errors) return [errors];

  await db("polls").where({ id }).update(data);
  return [undefined];
};

export const deletePoll = async (query: Omit<Poll, "title" | "body">) =>
  await db("polls").where(query).del();

export const getPolls = async (
  query: Partial<Poll> | undefined = {}
): Promise<Poll[]> => await db.select().from<Poll>("polls").where(query);

export const getPoll = async (
  query: Pick<Poll, "id">
): Promise<Poll | null> => {
  const res = await db
    .select("id", "title", "body", "creator")
    .from<Poll>("polls")
    .where(query);
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
