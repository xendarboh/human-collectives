import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import type { Choice } from "~/models/choice.server";
import type { PollFormActionData } from "~/ui/poll-form";
import { PollForm } from "~/ui/poll-form";
import { createPoll } from "~/models/poll.server";
import { requireAuthenticatedUser } from "~/auth.server";

export const getPollFormData = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const body = formData.get("body")?.toString();
  const title = formData.get("title")?.toString();
  const choicesRemovedId = formData.getAll("choicesRemovedId");

  // build choices from two sets of form data
  const choicesContent = formData.getAll("choicesContent");
  const choicesId = formData.getAll("choicesId");
  const choices: Array<Choice> = [];
  choicesId.forEach((_, index) =>
    choices.push({
      id: +choicesId[index],
      content: choicesContent[index].toString(),
    })
  );

  const values = {
    body,
    title,
    choices,
  };

  return { values, choicesRemovedId };
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAuthenticatedUser(request);
  return null;
};

export const action: ActionFunction = async (args) => {
  const auth = await requireAuthenticatedUser(args.request);
  const { values } = await getPollFormData(args);
  const [errors, poll] = await createPoll({ ...values, creator: auth.user.id });

  if (errors)
    return json<PollFormActionData>({ errors, values }, { status: 400 });

  invariant(poll, "Failed to create poll");
  return redirect(`/polls/${poll.id}`);
};

export default function NewPoll() {
  const actionData = useActionData() as PollFormActionData;

  return (
    <div>
      <h1 className="pb-2 text-2xl font-bold">Create Poll</h1>
      <PollForm method="post" actionData={actionData}></PollForm>
    </div>
  );
}
