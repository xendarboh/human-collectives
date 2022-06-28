import { db } from "~/db.server";

export type Poll = {
  id: number;
  title: string;
  body: string;
  creator: number;
};

export const createPoll = async (
  poll: Omit<Poll, "id">
): Promise<Poll | null> => {
  const res = await db.insert(poll, ["id"]).into("polls");
  return !res.length ? null : res[0];
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
