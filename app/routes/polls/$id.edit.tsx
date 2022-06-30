import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Poll } from "~/models/poll.server";
import type { PollFormActionData } from "~/ui/poll-form";
import { PollForm } from "~/ui/poll-form";
import { deleteChoices } from "~/models/choice.server";
import { getPollFormData } from "~/routes/polls/new";
import { requireAuthenticatedUser } from "~/auth.server";
import { updatePoll, getPoll, isPollCreator } from "~/models/poll.server";

type LoaderData = {
  poll: Poll;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Poll ID not found");
  const poll = await getPoll({ id: +params.id });
  if (!poll) throw new Response("Poll Not Found", { status: 404 });

  if (!isPollCreator(poll, auth.user.id)) {
    throw new Response("Access Denied: Only poll creator can edit", {
      status: 403,
    });
  }

  return { auth, poll };
};

export const loader: LoaderFunction = async (args) => {
  const { poll } = await common(args);
  return json<LoaderData>({ poll });
};

export const action: ActionFunction = async (args) => {
  const { poll } = await common(args);
  const { values, choicesRemoved } = await getPollFormData(args);
  const [errors] = await updatePoll(+poll.id, values);
  await deleteChoices(choicesRemoved);

  if (errors)
    return json<PollFormActionData>({ errors, values }, { status: 400 });

  return redirect(`/polls/${poll.id}`);
};

export default function EditPoll() {
  const actionData = useActionData() as PollFormActionData;
  const { poll } = useLoaderData() as LoaderData;

  return (
    <div>
      <h1 className="pb-2 text-2xl font-bold">Edit Poll</h1>
      <PollForm method="post" actionData={actionData} poll={poll}></PollForm>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 403:
    case 404:
      return <div>{caught.data}</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
