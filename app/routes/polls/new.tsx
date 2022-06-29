import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import type { PollFormActionData } from "~/ui/poll-form";
import { PollForm } from "~/ui/poll-form";
import { createPoll } from "~/models/poll.server";
import { requireAuthenticatedUser } from "~/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireAuthenticatedUser(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const auth = await requireAuthenticatedUser(request);

  const values = Object.fromEntries(await request.formData());
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
