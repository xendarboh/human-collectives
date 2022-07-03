import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useCatch } from "@remix-run/react";

import type { CollectiveJoinFormActionData } from "~/ui/collective-join-form";
import { CollectiveJoinForm } from "~/ui/collective-join-form";
import { joinCollective } from "~/models/member.server";
import { requireAuthenticatedUser } from "~/auth.server";

export const meta: MetaFunction = () => {
  return {
    title: "Join a Collective",
  };
};

export const common = async ({ request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);
  return { auth };
};

export const loader: LoaderFunction = async (args) => {
  await common(args);
  return null;
};

export const action: ActionFunction = async (args) => {
  const { auth } = await common(args);
  const formData = await args.request.formData();

  const values = {
    accessCode: formData.get("accessCode")?.toString(),
  };
  const [errors, member] = await joinCollective(+auth.user.id, values);

  if (errors || !member)
    return json<CollectiveJoinFormActionData>(
      { errors, values },
      { status: 400 }
    );

  return redirect(`/collectives/${member.collectiveId}`);
};

export default function JoinCollective() {
  const actionData = useActionData() as CollectiveJoinFormActionData;

  return (
    <div>
      <h1 className="pb-2 text-2xl font-bold">Join a Collective</h1>
      <CollectiveJoinForm
        method="post"
        actionData={actionData}
      ></CollectiveJoinForm>
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
