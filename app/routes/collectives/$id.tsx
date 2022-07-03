import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
} from "@remix-run/react";

import type { CollectiveJoinFormActionData } from "~/ui/collective-join-form";
import type { Collective } from "~/models/collective.server";
import { CollectiveJoinForm } from "~/ui/collective-join-form";
import { requireAuthenticatedUser } from "~/auth.server";
import {
  isCollectiveMember,
  joinCollective,
  leaveCollective,
} from "~/models/member.server";
import {
  deleteCollective,
  getCollective,
  isCollectiveCreator,
} from "~/models/collective.server";

type LoaderData = {
  collective: Collective;
  isCreator: boolean;
  isMember: boolean;
};

type ActionData = {
  joinForm: CollectiveJoinFormActionData;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Collective ID not found");
  const collective = await getCollective({ id: +params.id });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  const isCreator = isCollectiveCreator(collective, auth.user.id);
  const isMember = await isCollectiveMember(collective, auth.user.id);

  return { auth, collective, isCreator, isMember };
};

export const loader: LoaderFunction = async (args) =>
  json<LoaderData>(await common(args));

export const action: ActionFunction = async (args) => {
  const { auth, collective, isCreator, isMember } = await common(args);
  const formData = await args.request.formData();

  switch (formData.get("action")) {
    case "delete": {
      if (!isCreator) {
        throw new Response("Only the collective creator can delete it", {
          status: 403,
        });
      }
      await deleteCollective(collective.id);
      return redirect("/collectives");
    }

    case "leaveCollective": {
      if (!isMember) {
        throw new Response(
          "Only a collective member can leave the collective",
          {
            status: 403,
          }
        );
      }
      await leaveCollective(collective.id, auth.user.id);
      return null;
    }

    case "joinCollective": {
      if (isMember) {
        throw new Response("Only a non-member can join the collective", {
          status: 403,
        });
      }

      const values = {
        accessCode: formData.get("accessCode")?.toString(),
      };
      const [errors, member] = await joinCollective(+auth.user.id, values);
      if (errors || !member)
        return json({ joinForm: { errors, values } }, { status: 400 });
      return null;
    }

    default: {
      throw new Error("Unknown Action");
    }
  }
};

export default function CollectiveDetailsPage() {
  const { collective, isCreator, isMember } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{collective.title}</h3>
      <div className="grid gap-4">
        <pre className="py-6">{collective.description}</pre>

        {!isMember && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">Join this Collective</div>
            <CollectiveJoinForm
              method="post"
              actionData={actionData?.joinForm}
              collective={collective}
            >
              <input type="hidden" name="action" value="joinCollective" />
            </CollectiveJoinForm>
          </div>
        )}

        {isMember && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">You are a Collective Member</div>
            <Form method="post">
              <div className="flex gap-4">
                <button
                  type="submit"
                  name="action"
                  value="leaveCollective"
                  className="btn btn-warning"
                >
                  Leave
                </button>
              </div>
            </Form>
          </div>
        )}

        {isCreator && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">
              You are the Collective Creator
            </div>
            <div className="flex flex-grow items-center gap-2">
              <span className="witespace-nowrap">Membership Access Code:</span>
              <span className="rounded-box border-2 border-neutral bg-base-200 p-2 px-3 shadow-md">
                {collective.accessCode}
              </span>
            </div>
            <Form method="post">
              <div className="flex gap-4">
                <Link to="edit" className="btn btn-primary">
                  Edit
                </Link>
                <button
                  type="submit"
                  name="action"
                  value="delete"
                  className="btn btn-warning"
                >
                  Delete
                </button>
              </div>
            </Form>
            {/*
            <Form method="post">
              <div className="flex w-full flex-col lg:flex-row">
                {collective.members?.map((member, key) => (
                  <div key={key}>{member.userId}</div>
                ))}
              </div>
            </Form>
          */}
            <pre>{JSON.stringify(collective, null, 2)}</pre>
          </div>
        )}
      </div>
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
