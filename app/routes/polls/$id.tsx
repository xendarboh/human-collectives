import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import * as React from "react";
import invariant from "tiny-invariant";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import type { Collective } from "~/models/collective.server";
import type { Poll } from "~/models/poll.server";
import type { PollVote, Vote } from "~/models/vote.server";
import { PollVotes } from "~/ui/poll-votes";
import { castPollVote, getUserPollVote } from "~/models/vote.server";
import { getCollective } from "~/models/collective.server";
import { getPollVotes } from "~/models/vote.server";
import { requireAuthenticatedUser } from "~/auth.server";
import {
  deletePoll,
  getPoll,
  isPollCreator,
  updatePoll,
} from "~/models/poll.server";

type LoaderData = {
  isCreator: boolean;
  poll: Poll;
  collective: Collective;
  myVote: Vote;
  votes: PollVote[];
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Poll ID not found");
  const poll = await getPoll({ id: +params.id });
  if (!poll) throw new Response("Poll Not Found", { status: 404 });

  const collective = await getCollective({ id: poll.collective });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  const isCreator = isPollCreator(poll, auth.user.id);
  const [myVote] = await getUserPollVote(auth.user.id, poll.id);

  return { auth, collective, poll, isCreator, myVote };
};

export const loader: LoaderFunction = async (args) => {
  const { isCreator, collective, poll, myVote } = await common(args);
  const votes = await getPollVotes(poll.id);
  return json<LoaderData>({ isCreator, collective, poll, myVote, votes });
};

export const action: ActionFunction = async (args) => {
  const { auth, isCreator, poll } = await common(args);
  const formData = await args.request.formData();

  switch (formData.get("action")) {
    case "delete": {
      if (!isCreator) {
        throw new Response("Only the poll creator can delete it", {
          status: 403,
        });
      }
      await deletePoll(poll.id);
      return redirect("/polls");
    }

    case "publish": {
      if (!isCreator) {
        throw new Response("Only the poll creator can publish it", {
          status: 403,
        });
      }
      await updatePoll(poll.id, { isPublished: true }, { validate: false });
      return redirect(`/polls/${poll.id}`);
    }

    case "vote": {
      const choiceId = formData.get("choice");
      invariant(choiceId, "Choice ID missing");
      await castPollVote(poll.id, {
        userId: auth.user.id,
        choiceId: +choiceId,
      });
      return redirect(`/polls/${poll.id}`);
    }

    default: {
      throw new Error("Unknown Action");
    }
  }
};

export default function PollDetailsPage() {
  const { isCreator, collective, poll, myVote, votes } =
    useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{poll.title}</h3>

      <div className="my-4 grid gap-4">
        <pre>{poll.body}</pre>

        <div className="flex items-center gap-2">
          <span className="witespace-nowrap">Collective:</span>
          <span className="rounded-box border-2 border-neutral bg-base-200 p-2 px-3 shadow-md">
            <Link to={`/collectives/${collective.id}`} reloadDocument>
              {collective.title}
            </Link>
          </span>
        </div>

        {poll.isPublished && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">Choices</div>
            <Form method="post">
              <input type="hidden" name="action" value="vote" />
              <div className="flex w-full flex-col lg:flex-row">
                {poll.choices.map((choice, key) => (
                  <React.Fragment key={key}>
                    {key > 0 && (
                      <div className="divider lg:divider-horizontal">OR</div>
                    )}
                    <button
                      type="submit"
                      name="choice"
                      value={choice.id}
                      className={
                        "btn grid h-24 flex-grow place-items-center border-2 bg-base-100 lg:max-w-md " +
                        (choice.id == myVote?.choiceId ? "btn-secondary" : "")
                      }
                    >
                      {choice.content}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </Form>
          </div>
        )}

        {poll.isPublished && <PollVotes poll={poll} votes={votes} />}

        {isCreator && !poll.isPublished && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">You are the Poll Creator</div>
            <Form method="post">
              <div className="flex gap-4">
                <Link to="edit" className="btn btn-primary">
                  Edit
                </Link>
                <button
                  type="submit"
                  name="action"
                  value="publish"
                  className="btn btn-primary"
                >
                  Publish
                </button>
                <button
                  type="submit"
                  name="action"
                  value="delete"
                  className="btn btn-warning"
                >
                  Delete
                </button>
              </div>
            </Form>
            <pre>{JSON.stringify(poll, null, 2)}</pre>
          </div>
        )}
      </div>
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
