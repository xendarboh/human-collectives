import type { FormProps } from "@remix-run/react";
import * as React from "react";
import { Form } from "@remix-run/react";

import type { Collective } from "~/models/collective.server";

const CollectiveJoinForm = ({
  actionData,
  collective,
  children,
  ...props
}: CollectiveJoinFormProps) => {
  const accessCodeRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.accessCode) {
      accessCodeRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form {...props} className="grid gap-4">
      <div className="form-control">
        {!collective?.isOpenAccess && (
          <label className="label">
            <span className="label-text">Access Code:</span>
          </label>
        )}
        <input
          ref={accessCodeRef}
          name="accessCode"
          type={collective?.isOpenAccess ? "hidden" : "text"}
          className="input input-bordered input-primary w-full max-w-xs bg-primary-content"
          aria-invalid={actionData?.errors?.accessCode ? true : undefined}
          aria-errormessage={
            actionData?.errors?.accessCode ? "accessCode-error" : undefined
          }
          placeholder=""
          defaultValue={
            collective?.accessCode || actionData?.values?.accessCode
          }
        />
        {actionData?.errors?.accessCode && (
          <div className="pt-1 text-red-700" id="accessCode-error">
            {actionData.errors.accessCode}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <button type="submit" className="btn btn-primary">
          Join
        </button>
      </div>
      {children}
    </Form>
  );
};

CollectiveJoinForm.displayName = "CollectiveJoinForm";

type CollectiveJoinFormActionData = {
  errors?: {
    accessCode?: string;
  };
  values?: {
    accessCode?: string;
  };
};

interface CollectiveJoinFormProps extends FormProps {
  actionData: CollectiveJoinFormActionData;
  collective?: Collective;
}

export type { CollectiveJoinFormActionData, CollectiveJoinFormProps };
export { CollectiveJoinForm };
