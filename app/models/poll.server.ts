import { db } from "~/db.server";

export type Poll = {
  id: number;
  title?: string;
  body?: string;
};

export const createPoll = async (poll: Omit<Poll, "id">): Promise<Poll[]> =>
  await db.insert(poll, ["id"]).into("polls");

export const deletePoll = async (query: Poll) =>
  await db("polls").where(query).del();

export const getPolls = async (): Promise<Poll[]> =>
  await db.select("id", "title", "body").from<Poll>("polls");

export const getPoll = async (query: Poll): Promise<Poll | null> => {
  const res = await db
    .select("id", "title", "body")
    .from<Poll>("polls")
    .where(query);
  return !res.length ? null : res[0];
};
