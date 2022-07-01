import type { FormProps } from "@remix-run/react";
import * as React from "react";
import { Link, Form } from "@remix-run/react";

import type { Collective } from "~/models/collective.server";

const CollectiveForm = ({
  actionData,
  collective,
  ...props
}: CollectiveFormProps) => {
  const titleRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
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
          defaultValue={collective?.title || actionData?.values?.title}
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
          ref={descriptionRef}
          name="description"
          className="textarea textarea-bordered textarea-primary h-36 bg-primary-content"
          aria-invalid={actionData?.errors?.description ? true : undefined}
          aria-errormessage={
            actionData?.errors?.description ? "description-error" : undefined
          }
          placeholder=""
          defaultValue={
            collective?.description || actionData?.values?.description
          }
        ></textarea>
        {actionData?.errors?.description && (
          <div className="pt-1 text-red-700" id="description-error">
            {actionData.errors.description}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <Link
          to={collective ? `/collectives/${collective.id}` : "/collectives/"}
          className="btn btn-primary"
        >
          Cancel
        </Link>
      </div>
    </Form>
  );
};

CollectiveForm.displayName = "CollectiveForm";

type CollectiveFormActionData = {
  errors?: {
    title?: string;
    description?: string;
    members?: string;
  };
  values?: {
    title?: string;
    description?: string;
    members?: Array<number>;
  };
};

interface CollectiveFormProps extends FormProps {
  actionData: CollectiveFormActionData;
  collective?: Collective;
}

export type { CollectiveFormActionData, CollectiveFormProps };
export { CollectiveForm };
