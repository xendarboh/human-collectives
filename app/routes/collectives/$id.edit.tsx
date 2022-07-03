import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Collective } from "~/models/collective.server";
import type { CollectiveFormActionData } from "~/ui/collective-form";
import { CollectiveForm } from "~/ui/collective-form";
import { getCollectiveFormData } from "~/routes/collectives/new";
import { requireAuthenticatedUser } from "~/auth.server";
import {
  updateCollective,
  getCollective,
  isCollectiveCreator,
} from "~/models/collective.server";

type LoaderData = {
  collective: Collective;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Collective ID not found");
  const collective = await getCollective({ id: +params.id });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  if (!isCollectiveCreator(collective, auth.user.id)) {
    throw new Response("Access Denied: Only collective creator can edit", {
      status: 403,
    });
  }

  return { auth, collective };
};

export const loader: LoaderFunction = async (args) => {
  const { collective } = await common(args);
  return json<LoaderData>({ collective });
};

export const action: ActionFunction = async (args) => {
  const { collective } = await common(args);
  const { values } = await getCollectiveFormData(args);
  const [errors] = await updateCollective(+collective.id, values);

  if (errors)
    return json<CollectiveFormActionData>({ errors, values }, { status: 400 });

  return redirect(`/collectives/${collective.id}`);
};

export default function EditCollective() {
  const actionData = useActionData() as CollectiveFormActionData;
  const { collective } = useLoaderData() as LoaderData;

  return (
    <div>
      <h1 className="pb-2 text-2xl font-bold">Edit Collective</h1>
      <CollectiveForm
        method="post"
        actionData={actionData}
        collective={collective}
      ></CollectiveForm>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 403:
    case 404:
      return <div>{caught.data}</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
