import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import type { Collective } from "~/models/collective.server";
import { requireAuthenticatedUser } from "~/auth.server";
import {
  deleteCollective,
  getCollective,
  isCollectiveCreator,
} from "~/models/collective.server";

type LoaderData = {
  isCreator: boolean;
  collective: Collective;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Collective ID not found");
  const collective = await getCollective({ id: +params.id });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  const isCreator = isCollectiveCreator(collective, auth.user.id);

  return { auth, collective, isCreator };
};

export const loader: LoaderFunction = async (args) =>
  json<LoaderData>(await common(args));

export const action: ActionFunction = async (args) => {
  const { isCreator, collective } = await common(args);
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

    // ?: case "publish": {
    // ?:   if (!isCreator) {
    // ?:     throw new Response("Only the collective creator can publish it", {
    // ?:       status: 403,
    // ?:     });
    // ?:   }
    // ?:   await updateCollective(
    // ?:     collective.id,
    // ?:     { isPublished: true },
    // ?:     { validate: false }
    // ?:   );
    // ?:   return redirect(`/collectives/${collective.id}`);
    // ?: }

    default: {
      throw new Error("Unknown Action");
    }
  }
};

export default function CollectiveDetailsPage() {
  const { isCreator, collective } = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{collective.title}</h3>
      <pre className="py-6">{collective.description}</pre>
      <div>
        <div className="divider"></div>
        <Form method="post">
          <input type="hidden" name="action" value="vote" />
          <div className="flex w-full flex-col lg:flex-row">
            {collective.members?.map((member, key) => (
              <div key={key}>{member.nickname}</div>
            ))}
          </div>
        </Form>
        <div className="divider"></div>
      </div>
      {isCreator && (
        <div>
          <hr className="my-4" />
          <div className="alert my-4 shadow-md">
            Membership Access Code: {collective.accessCode}
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
          <pre>{JSON.stringify(collective, null, 2)}</pre>
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
