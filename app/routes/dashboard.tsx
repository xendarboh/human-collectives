import type { LoaderFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { requireAuthenticatedUser } from "~/auth.server";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await requireAuthenticatedUser(request);
  return { auth };
};

export default function Dashboard() {
  const { auth } = useLoaderData();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome to Dashboard... you auth'd user!
      </h1>
      <h3>humanode identifer = {auth.id}</h3>
      <br />
      <ul className="list-disc">
        <li>
          <Link to="/">home</Link>
        </li>
        <li>
          <Link to="/posts">Posts</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
      <br />
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
}
