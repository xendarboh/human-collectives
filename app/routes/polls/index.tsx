import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import type { Poll } from "~/models/poll.server";
import { getPolls } from "~/models/poll.server";
import { PollCard } from "~/ui/poll-card";

type LoaderData = {
  polls: Array<Poll>;
};

export const loader: LoaderFunction = async () => {
  return json({
    polls: await getPolls(),
  });
};

export default function Polls() {
  const { polls } = useLoaderData() as LoaderData;

  return (
    <main>
      <h1 className="text-2xl font-bold">Polls</h1>
      <div className="grid place-items-center">
        {polls.map((poll) => (
          <div key={poll.id} className="my-2">
            <PollCard poll={poll} data-theme="light" />
          </div>
        ))}
      </div>
    </main>
  );
}
