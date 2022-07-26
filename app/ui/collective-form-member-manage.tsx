import type { FormProps } from "@remix-run/react";
import * as React from "react";
import { Form } from "@remix-run/react";

import type { Collective } from "~/models/collective.server";

const CollectiveFormMemberManage = ({
  actionData,
  collective,
  children,
  ...props
}: CollectiveFormMemberManageProps) => {
  const authIdRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.authId) {
      authIdRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form {...props} className="grid gap-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Member HUMΔNODE Identifier:</span>
        </label>
        <input
          ref={authIdRef}
          name="authId"
          type="text"
          className="input input-bordered input-primary w-full max-w-xs bg-primary-content"
          aria-invalid={actionData?.errors?.authId ? true : undefined}
          aria-errormessage={
            actionData?.errors?.authId ? "authId-error" : undefined
          }
          placeholder=""
          defaultValue={actionData?.values?.authId}
        />
        {actionData?.errors?.authId && (
          <div className="pt-1 text-red-700" id="authId-error">
            {actionData.errors.authId}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          name="action"
          value="addMember"
          className="btn btn-primary"
        >
          Add
        </button>
        <button
          type="submit"
          name="action"
          value="removeMember"
          className="btn btn-warning"
        >
          Remove
        </button>
      </div>
      {children}
    </Form>
  );
};

CollectiveFormMemberManage.displayName = "CollectiveFormMemberManage";

type CollectiveFormMemberManageActionData = {
  success?: string;
  errors?: {
    authId?: string;
  };
  values?: {
    authId?: string;
  };
};

interface CollectiveFormMemberManageProps extends FormProps {
  actionData?: CollectiveFormMemberManageActionData;
  collective?: Collective;
}

export type {
  CollectiveFormMemberManageActionData,
  CollectiveFormMemberManageProps,
};
export { CollectiveFormMemberManage };
