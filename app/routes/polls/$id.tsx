import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Poll } from "~/models/poll.server";
import { deletePoll } from "~/models/poll.server";
import { getPoll } from "~/models/poll.server";
// TODO: import { requireUserId } from "~/session.server";

type LoaderData = {
  poll: Poll;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  // TODO: const userId = await requireUserId(request);
  invariant(params.id, "Poll ID not found");

  // TODO: const poll = await getPoll({ userId, id: params.pollId });
  const poll = await getPoll({ id: +params.id });
  if (!poll) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ poll });
};

export const action: ActionFunction = async ({ request, params }) => {
  // TODO: const userId = await requireUserId(request);
  invariant(params.id, "Poll ID not found");

  // TODO: await deletePoll({ userId, id: params.pollId });
  await deletePoll({ id: +params.id });
  return redirect("/polls");
};

export default function PollDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.poll.title}</h3>
      <p className="py-6">{data.poll.body}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Poll not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}