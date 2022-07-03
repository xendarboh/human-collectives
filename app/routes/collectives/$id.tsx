import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import type { Collective } from "~/models/collective.server";
import { isCollectiveMember, leaveCollective } from "~/models/member.server";
import { requireAuthenticatedUser } from "~/auth.server";
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

    default: {
      throw new Error("Unknown Action");
    }
  }
};

export default function CollectiveDetailsPage() {
  const { collective, isCreator, isMember } = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{collective.title}</h3>
      <pre className="py-6">{collective.description}</pre>
      {isMember && (
        <div className="rounded-box mb-4 border-2 border-base-content bg-base-300 p-2 shadow-md">
          <span className="text-lg font-bold">You are a Collective Member</span>
          <Form method="post">
            <div className="mt-2 flex gap-4">
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
        <div className="rounded-box border-2 border-base-content bg-base-300 p-2 shadow-md">
          <div className="text-lg font-bold">
            You are the Collective Creator
          </div>
          <div className="alert mt-2 shadow-md">
            Membership Access Code: {collective.accessCode}
          </div>
          <Form method="post">
            <div className="mt-4 flex gap-4">
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
        </div>
      )}
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
