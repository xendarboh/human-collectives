import type { FormProps } from "@remix-run/react";
import * as React from "react";
import { Link, Form } from "@remix-run/react";

import type { Poll } from "~/models/poll.server";

const PollForm = ({ actionData, poll, ...props }: PollFormProps) => {
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form {...props} className="grid gap-2">
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Title:</span>
        </label>
        <input
          ref={titleRef}
          name="title"
          type="text"
          className="input input-bordered input-primary w-full max-w-xs bg-primary-content"
          aria-invalid={actionData?.errors?.title ? true : undefined}
          aria-errormessage={
            actionData?.errors?.title ? "title-error" : undefined
          }
          placeholder="A short descriptive title..."
          defaultValue={poll?.title || actionData?.values?.title}
        />
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          ref={bodyRef}
          name="body"
          className="textarea textarea-bordered textarea-primary h-36 bg-primary-content"
          aria-invalid={actionData?.errors?.body ? true : undefined}
          aria-errormessage={
            actionData?.errors?.body ? "body-error" : undefined
          }
          placeholder=""
          defaultValue={poll?.body || actionData?.values?.body}
        ></textarea>
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <Link
          to={poll ? `/polls/${poll.id}` : "/polls/"}
          className="btn btn-primary"
        >
          Cancel
        </Link>
      </div>
    </Form>
  );
};

PollForm.displayName = "PollForm";

type PollFormActionData = {
  errors?: {
    title?: string;
    body?: string;
  };
  values?: {
    title?: string;
    body?: string;
  };
};

interface PollFormProps extends FormProps {
  actionData: PollFormActionData;
  poll?: Poll;
}

export type { PollFormActionData, PollFormProps };
export { PollForm };
