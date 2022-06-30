import invariant from "tiny-invariant";

import type { QueryOptions } from "~/db.server";
import { db, defaultQueryOptions } from "~/db.server";

export interface Choice {
  id: number;
  content: string;
}

export interface choice2poll {
  choiceId: number;
  pollId: number;
}

export const getChoices = async (
  query: Partial<Choice> | undefined = {}
): Promise<Choice[]> => await db.select().from<Choice>("choices").where(query);

// select choices.id, choices.content from choices left join choice2poll ON
// choices.id = choice2poll.choiceId where choice2poll.pollId = 11;
export const getPollChoices = async (pollId: number): Promise<Array<Choice>> =>
  await db("choices")
    .select("choices.*")
    .leftJoin("choice2poll", "choices.id", "=", "choice2poll.choiceId")
    .where({ pollId });

// updates or inserts
// choices that do not yet exist in the database are given with id=0
export const updatePollChoices = async (
  pollId: number,
  choices: Array<Choice>,
  opts: QueryOptions = defaultQueryOptions
): Promise<[any, Array<Choice> | null]> => {
  const errors = opts.validate ? validatePollChoices(choices) : undefined;
  if (errors) return [errors, null];

  choices.forEach(async ({ id: choiceId, content }: Choice) => {
    if (choiceId > 0) {
      await db("choices").update({ content }).where({ id: choiceId });
    } else {
      const [{ id: choiceId }] = await db("choices").insert({ content }, [
        "id",
      ]);
      invariant(choiceId, "Insert choice failed");
      await db("choice2poll").insert({ choiceId, pollId });
    }
  });
  return [undefined, await getPollChoices(pollId)];
};

// delete choices by poll id
export const deletePollChoices = async (pollId: number) => {
  const choices = await getPollChoices(pollId);
  const ids: Array<number> = [];
  choices.map((x) => ids.push(x.id));
  await deleteChoices(ids);
};

// delete choices by array of choice ids
export const deleteChoices = async (ids: Array<any>) => {
  await db("choices").whereIn("id", ids).del();
  await db("choice2poll").whereIn("choiceId", ids).del();
};

export const validatePollChoices = (choices: any) => {
  if (typeof choices !== "object" || choices.length === 0)
    return "Choices are required";

  let empty = false;
  choices.forEach((x: Choice) => {
    if (typeof x.content !== "string" || x.content.length === 0) empty = true;
  });
  if (empty) return "Choices may not be empty";

  let duplicate = false;
  choices.forEach((x: Choice) => {
    const dups = choices.filter((y: Choice) => x.content === y.content);
    if (dups.length !== 1) duplicate = true;
  });
  if (duplicate) return "Choices must be unique";

  return undefined;
};
