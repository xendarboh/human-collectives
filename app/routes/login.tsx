import type { LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { authenticator } from "~/auth.server";
import { commitSession } from "~/session.server";
import { getSession } from "~/session.server";

type LoaderData = {
  auth?: any;
  error?: any;
};

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await authenticator.isAuthenticated(request);
  const session = await getSession(request.headers.get("Cookie"));
  let error = session.get(authenticator.sessionErrorKey);
  return json(
    { auth, error },
    {
      headers: {
        // necessary to clear the authentication "flash" message
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export default function Login() {
  const data = useLoaderData() as LoaderData;
  return (
    <div>
      <Form action="/auth/humanode" method="post">
        <button>Bioauthenticate with Humanode</button>
      </Form>
      <div>{data.error && <p>ERROR: {data.error?.message}</p>}</div>
    </div>
  );
}
