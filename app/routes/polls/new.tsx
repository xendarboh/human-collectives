import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";

import type { Choice } from "~/models/choice.server";
import type { Collective } from "~/models/collective.server";
import type { PollFormActionData } from "~/ui/poll-form";
import { PollForm } from "~/ui/poll-form";
import { createPoll } from "~/models/poll.server";
import { getMemberCollectives } from "~/models/member.server";
import { requireAuthenticatedUser } from "~/auth.server";

type LoaderData = {
  collectives: Array<Collective>;
};

export const meta: MetaFunction = () => {
  return {
    title: "Poll the Collective",
  };
};

export const getPollFormData = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const collective = formData.get("collective")?.toString();
  const title = formData.get("title")?.toString();
  const body = formData.get("body")?.toString();
  const choicesRemoved = formData.getAll("choicesRemoved");

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
    collective,
    body,
    title,
    choices,
  };

  return { values, choicesRemoved };
};

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await requireAuthenticatedUser(request);
  const collectives = await getMemberCollectives(auth.user.id);
  return json<LoaderData>({ collectives });
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
  const { collectives } = useLoaderData() as LoaderData;

  return (
    <div>
      <h1 className="pb-2 text-2xl font-bold">Create a Poll</h1>
      <PollForm
        method="post"
        actionData={actionData}
        collectives={collectives}
      ></PollForm>
    </div>
  );
}
