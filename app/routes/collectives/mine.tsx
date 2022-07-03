import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import type { Collective } from "~/models/collective.server";
import { getCreatorCollectives } from "~/models/collective.server";
import { getMemberCollectives } from "~/models/member.server";
import { requireAuthenticatedUser } from "~/auth.server";
// ?: import { CollectiveCard } from "~/ui/collective-card";

type LoaderData = {
  creatorCollectives: Array<Collective>;
  memberCollectives: Array<Collective>;
};

export const meta: MetaFunction = () => {
  return {
    title: "My Collectives",
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await requireAuthenticatedUser(request);

  return json({
    creatorCollectives: await getCreatorCollectives(auth.user.id),
    memberCollectives: await getMemberCollectives(auth.user.id),
  });
};

export default function Collectives() {
  const { creatorCollectives, memberCollectives } =
    useLoaderData() as LoaderData;

  return (
    <main>
      <h1 className="text-2xl font-bold">My Collectives</h1>
      <div className="grid place-items-center">
        {memberCollectives.map((collective) => (
          <div key={collective.id} className="my-2">
            <Link to={`/collectives/${collective.id}`}>{collective.title}</Link>
            {/* <CollectiveCard collective={collective} data-theme="light" /> */}
          </div>
        ))}
      </div>
      {creatorCollectives.length !== 0 && (
        <>
          <div className="divider"></div>
          <div className="text-2xl font-bold">Created Collectives</div>
          <div className="grid place-items-center">
            {creatorCollectives.map((collective) => (
              <div key={collective.id} className="my-2">
                <Link to={`/collectives/${collective.id}`}>
                  {collective.title}
                </Link>
                {/* <CollectiveCard collective={collective} data-theme="light" /> */}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
