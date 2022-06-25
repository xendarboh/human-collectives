import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import type { Poll } from "~/models/poll.server";
import { getPolls } from "~/models/poll.server";

type LoaderData = {
  polls: Array<Poll>;
};

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    polls: await getPolls(),
  });
};

export default function Polls() {
  const { polls } = useLoaderData() as LoaderData;

  return (
    <main>
      <h1 className="text-2xl font-bold">Polls</h1>
      <ul className="list-disc">
        {polls.map((poll) => (
          <li key={poll.id}>
            <Link to={`/polls/${poll.id}`}>
              {poll.id} | {poll.title} | {poll.body}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
