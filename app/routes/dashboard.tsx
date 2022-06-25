import type { LoaderFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { useLoaderData } from "@remix-run/react";
import { verifyJWT } from "~/utils/jwt.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const jwtClaims = await verifyJWT(user.jwt || "");
  const error = jwtClaims.error;

  return { user, error };
};

export default function Dashboard() {
  const { user, error } = useLoaderData();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome to Dashboard... you auth'd user!
      </h1>
      <h3>humanode identifer = {user.id}</h3>
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
      <pre>{JSON.stringify(user, null, 2)}</pre>
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
    </div>
  );
}
