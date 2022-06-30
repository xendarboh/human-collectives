import type { FormProps } from "@remix-run/react";
import * as React from "react";
import { Link, Form } from "@remix-run/react";

import type { Choice } from "~/models/choice.server";
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

  const [choicesRemoved, setChoicesRemoved] = React.useState<Array<number>>([]);

  const [choices, setChoices] = React.useState<Array<Choice>>(
    poll?.choices || actionData?.values?.choices || []
  );

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

      <div>
        <label className="label">
          <span className="label-text">Choices</span>
        </label>
        <div className="grid gap-1">
          {choicesRemoved.map((id, key) => (
            <input key={key} type="hidden" name="choicesRemoved" value={id} />
          ))}
          {choices.map((choice, key) => (
            <div key={key} className="flex items-center space-x-1">
              <input type="hidden" name="choicesId" value={choice.id} />
              <input
                type="text"
                name="choicesContent"
                className="input input-bordered input-primary w-full max-w-xs bg-primary-content"
                value={choices[key].content}
                onChange={(e) => {
                  let n = [...choices];
                  n[key].content = e.target.value;
                  setChoices(n);
                }}
              />
              <span
                className="btn btn-circle btn-sm"
                onClick={() => {
                  setChoices(choices.filter((_, i) => i !== key));
                  if (choice.id > 0)
                    setChoicesRemoved([...choicesRemoved, choice.id]);
                }}
              >
                {/* cross sign */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
            </div>
          ))}
          <span
            className="btn btn-circle btn-sm mt-1"
            onClick={() => setChoices([...choices, { id: 0, content: "" }])}
          >
            {/* plus sign */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 18L12 6M6 12l12 0"
              />
            </svg>
          </span>
        </div>
        {actionData?.errors?.choices && (
          <div className="pt-1 text-red-700" id="choices-error">
            {actionData.errors.choices}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
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
    choices?: string;
  };
  values?: {
    title?: string;
    body?: string;
    choices?: Array<Choice>;
  };
};

interface PollFormProps extends FormProps {
  actionData: PollFormActionData;
  poll?: Poll;
}

export type { PollFormActionData, PollFormProps };
export { PollForm };
