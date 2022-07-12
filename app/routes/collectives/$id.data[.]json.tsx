// A Resource Route for exporting collective data for public proof/verification data
import type { LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { json } from "@remix-run/node";

import { getCollective } from "~/models/collective.server";
import { getSMTree } from "~/models/smt.server";
import { requireAuthenticatedUser } from "~/auth.server";

type LoaderData = {
  root: string;
  nodes: string;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  await requireAuthenticatedUser(request);

  invariant(params.id, "Collective ID not found");
  const collective = await getCollective({ id: +params.id });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  const id = { type: "collective", key: collective.id };
  const smt = await getSMTree(id, ["root", "nodes"]);
  if (!smt) throw new Response("Collective Not found", { status: 404 });

  return json<LoaderData>({
    root: smt.root,
    nodes: JSON.parse(smt.nodes),
  });
};
