import invariant from "tiny-invariant";
import { db } from "~/db.server";

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
export const getPollChoices = async (
  pollId: number
): Promise<Array<Choice>> => {
  const res = await db("choices")
    .select("choices.*")
    .leftJoin("choice2poll", "choices.id", "=", "choice2poll.choiceId")
    .where({ pollId });
  console.log("getPollChoices", res);
  return res;
};

export const updatePollChoices = async (
  pollId: number,
  choices: Array<Choice>
): Promise<[any, Array<Choice>]> => {
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
