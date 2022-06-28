import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { requireAuthenticatedUser } from "~/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await requireAuthenticatedUser(request);
  return { auth };
};

export default function Dashboard() {
  const { auth } = useLoaderData();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <h3>humanode identifer = {auth.id}</h3>
      <br />
    </div>
  );
}
