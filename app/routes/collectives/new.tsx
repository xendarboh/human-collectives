import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import type { CollectiveFormActionData } from "~/ui/collective-form";
import { CollectiveForm } from "~/ui/collective-form";
import { createCollective } from "~/models/collective.server";
import { requireAuthenticatedUser } from "~/auth.server";

export const meta: MetaFunction = () => {
  return {
    title: "Create a Collective",
  };
};

export const getCollectiveFormData = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const isPublic = formData.get("isPublic") ? true : false;
  const isOpenAccess = formData.get("isOpenAccess") ? true : false;
  const isManaged = formData.get("isManaged") ? true : false;

  const values = {
    title,
    description,
    isPublic,
    isOpenAccess,
    isManaged,
  };
  return { values };
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAuthenticatedUser(request);
  return null;
};

export const action: ActionFunction = async (args) => {
  const auth = await requireAuthenticatedUser(args.request);
  const { values } = await getCollectiveFormData(args);
  console.log("new collective", values);
  const [errors, collective] = await createCollective({
    ...values,
    creator: auth.user.id,
  });

  if (errors)
    return json<CollectiveFormActionData>({ errors, values }, { status: 400 });
  invariant(collective, "Failed to create collective");

  return redirect(`/collectives/${collective.id}`);
};

export default function NewCollective() {
  const actionData = useActionData() as CollectiveFormActionData;

  return (
    <div>
      <h1 className="pb-2 text-2xl font-bold">Create a Collective</h1>
      <CollectiveForm method="post" actionData={actionData}></CollectiveForm>
    </div>
  );
}
