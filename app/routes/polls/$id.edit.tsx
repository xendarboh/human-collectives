import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Collective } from "~/models/collective.server";
import type { Poll } from "~/models/poll.server";
import type { PollFormActionData } from "~/ui/poll-form";
import { PollForm } from "~/ui/poll-form";
import { deleteChoices } from "~/models/choice.server";
import { getCollective } from "~/models/collective.server";
import { getMemberCollectives } from "~/models/member.server";
import { getPollFormData } from "~/routes/polls/new";
import { requireAuthenticatedUser } from "~/auth.server";
import { updatePoll, getPoll, isPollCreator } from "~/models/poll.server";

type LoaderData = {
  collectives: Array<Collective>;
  collective: Collective;
  poll: Poll;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Poll ID not found");
  const poll = await getPoll({ id: +params.id });
  if (!poll) throw new Response("Poll Not Found", { status: 404 });

  const collective = await getCollective({ id: poll.collective });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  if (!isPollCreator(poll, auth.user.id)) {
    throw new Response("Access Denied: Only poll creator can edit", {
      status: 403,
    });
  }

  return { auth, collective, poll };
};

export const loader: LoaderFunction = async (args) => {
  const { auth, collective, poll } = await common(args);
  const collectives = await getMemberCollectives(auth.user.id);
  return json<LoaderData>({ collectives, collective, poll });
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
  const { collective, collectives, poll } = useLoaderData() as LoaderData;

  return (
    <div>
      <h1 className="pb-2 text-2xl font-bold">Edit Poll</h1>
      <PollForm
        method="post"
        actionData={actionData}
        collective={collective}
        collectives={collectives}
        poll={poll}
      ></PollForm>
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
