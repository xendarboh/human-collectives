import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import type { Collective } from "~/models/collective.server";
import { getCollectives } from "~/models/collective.server";
// ?: import { CollectiveCard } from "~/ui/collective-card";

type LoaderData = {
  collectives: Array<Collective>;
};

export const meta: MetaFunction = () => {
  return {
    title: "Public Collectives",
  };
};

export const loader: LoaderFunction = async () => {
  return json({
    collectives: await getCollectives({ isPublic: true }),
  });
};

export default function Collectives() {
  const { collectives } = useLoaderData() as LoaderData;

  return (
    <main>
      <h1 className="text-2xl font-bold">Public Collectives</h1>
      <div className="grid place-items-center">
        {collectives.map((collective) => (
          <div key={collective.id} className="my-2">
            <Link to={`/collectives/${collective.id}`}>{collective.title}</Link>
            {/* <CollectiveCard collective={collective} data-theme="light" /> */}
          </div>
        ))}
      </div>
    </main>
  );
}
