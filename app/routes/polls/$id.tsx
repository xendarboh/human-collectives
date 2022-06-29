import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Poll } from "~/models/poll.server";
import { deletePoll, getPoll, isPollCreator } from "~/models/poll.server";
import { requireAuthenticatedUser } from "~/auth.server";

type LoaderData = {
  isCreator: boolean;
  poll: Poll;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Poll ID not found");
  const poll = await getPoll({ id: +params.id });
  if (!poll) throw new Response("Poll Not Found", { status: 404 });

  const isCreator = isPollCreator(poll, auth.user.id);

  return { auth, poll, isCreator };
};

export const loader: LoaderFunction = async (args) => {
  const { isCreator, poll } = await common(args);
  return json<LoaderData>({ isCreator, poll });
};

export const action: ActionFunction = async (args) => {
  const { auth, poll } = await common(args);
  await deletePoll({ id: poll.id, creator: auth.user.id });
  return redirect("/polls");
};

export default function PollDetailsPage() {
  const { isCreator, poll } = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{poll.title}</h3>
      <pre className="py-6">{poll.body}</pre>
      {isCreator && (
        <div>
          <hr className="my-4" />
          <Form method="post">
            <div className="flex gap-4">
              <Link to="edit" className="btn btn-primary">
                Edit
              </Link>
              <Link to="publish" className="btn btn-primary">
                Publish
              </Link>
              <button type="submit" className="btn btn-warning">
                Delete
              </button>
            </div>
          </Form>
        </div>
      )}
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
