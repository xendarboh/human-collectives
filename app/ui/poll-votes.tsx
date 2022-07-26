import * as React from "react";

import type { Poll } from "~/models/poll.server";
import type { PollVote } from "~/models/vote.server";

const PollVotes = React.forwardRef<HTMLDivElement, PollVotesProps>(
  ({ children, poll, votes, ...props }, ref) => {
    return (
      <div
        ref={ref}
        tabIndex="0"
        className="collapse collapse-arrow rounded-box border-2 border-base-content bg-base-300 shadow-md"
        {...props}
      >
        <div className="collapse-title text-lg font-bold">Votes</div>
        <div className="collapse-content">
          <div className="stats stats-vertical shadow lg:stats-horizontal">
            {votes.map((vote) => (
              <div key={vote.choiceId} className="stat place-items-center">
                <div className="stat-title">{vote.content}</div>
                <div className="stat-value">{vote.count}</div>
                <div className="stat-desc"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

PollVotes.displayName = "PollVotes";

interface PollVotesProps extends React.ComponentPropsWithRef<"div"> {
  poll: Poll;
  votes: PollVote[];
}

export type { PollVotesProps };
export { PollVotes };
