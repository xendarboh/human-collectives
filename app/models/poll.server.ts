import invariant from "tiny-invariant";

import type { Choice } from "~/models/choice.server";
import { db } from "~/db.server";
import {
  getPollChoices,
  updatePollChoices,
  validatePollChoices,
} from "~/models/choice.server";

export interface Poll {
  id: number;
  title: string;
  body: string;
  creator: number;
  isPublished: boolean;
  choices: Array<Choice>;
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
  const { choices, ...pollData } = data;
  const [{ id }] = await db.insert(pollData, ["id"]).into("polls");
  invariant(id, "Insert poll failed");

  if (choices) await updatePollChoices(id, choices);
  return [errors, await getPoll({ id })];
};

export const updatePoll = async (
  id: number,
  data: Partial<Poll>,
  opts: PollQueryOptions = defaultQueryOpts
): Promise<[any, Poll | null]> => {
  const errors = opts.validate ? validatePoll(data) : undefined;
  if (errors) return [errors, null];

  const { choices, ...pollData } = data;
  await db("polls").where({ id }).update(pollData);
  if (choices) await updatePollChoices(id, choices);
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
  const [res] = await db.select().from<Poll>("polls").where(query);
  if (!res) return null;
  return {
    ...res,
    choices: await getPollChoices(res.id),
  };
};

export const isPollCreator = (poll: Poll, userID: number): boolean =>
  poll.creator === userID;

export const validatePoll = (data: any) => {
  const errors = {
    title: validatePollTitle(data.title),
    body: validatePollBody(data.body),
    choices: validatePollChoices(data.choices),
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
