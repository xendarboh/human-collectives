import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import { nanoid } from "nanoid";
import { useActionData } from "@remix-run/react";

import type { CollectiveFormActionData } from "~/ui/collective-form";
import { CollectiveForm } from "~/ui/collective-form";
import { createCollective } from "~/models/collective.server";
import { getSMTree } from "~/models/smt.server";
import { hashCode, newSMTree, saveSMTree } from "~/utils/smt.server";
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

  const values = {
    title,
    description,
    isPublic,
    isOpenAccess,
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

  // create an SMT for the collective
  // insert something random to initialize its root to non-zero
  const type = "collective";
  const key = collective.id;
  const tree = await newSMTree();
  await tree.insert(hashCode(type + key), hashCode(nanoid()));
  await saveSMTree({ type, key }, tree.db);
  const res = await getSMTree({ type, key });
  invariant(res, "Failed to create collective's merkle tree");

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
