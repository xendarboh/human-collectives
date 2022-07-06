import type { DataFunctionArgs, LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";

import type { Collective } from "~/models/collective.server";
import { requireAuthenticatedUser } from "~/auth.server";
import { getCollective } from "~/models/collective.server";
import { getSMTree } from "~/models/smt.server";

type LoaderData = {
  collective: Collective;
  nodes: string;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Collective ID not found");
  const collective = await getCollective({ id: +params.id });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  const smt = await getSMTree({ type: "collective", key: collective.id }, [
    "nodes",
  ]);
  if (!smt) throw new Response("Collective SMT Not found", { status: 404 });

  return { auth, collective, nodes: JSON.parse(smt.nodes) };
};

export const loader: LoaderFunction = async (args) =>
  json<LoaderData>(await common(args));

export default function CollectiveSMTJson() {
  const { nodes } = useLoaderData() as LoaderData;

  return <pre>{JSON.stringify(nodes, null, 2)}</pre>;
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
