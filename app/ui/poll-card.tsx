import * as React from "react";
import { Link } from "@remix-run/react";

import type { Poll } from "~/models/poll.server";

const PollCard = React.forwardRef<HTMLDivElement, PollCardProps>(
  ({ children, poll, ...props }, ref) => {
    return (
      <div ref={ref} {...props} className="card w-96 bg-base-100 shadow-xl">
        <Link to={`/polls/${poll.id}`}>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">{poll.title}</h2>
              <span className="text-xs">#{poll.id}</span>
            </div>
            <p>{poll.body}</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Fashion</div>
              <div className="badge badge-outline">Products</div>
              <div className="badge badge-secondary">NEW</div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

PollCard.displayName = "PollCard";

interface PollCardProps extends React.ComponentPropsWithRef<"div"> {
  poll: Poll;
}

export type { PollCardProps };
export { PollCard };
