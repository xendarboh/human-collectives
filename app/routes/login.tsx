import type { LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import type { AuthenticatedUser } from "~/auth.server";
import { AlertError } from "~/ui/alerts";
import { authenticator } from "~/auth.server";
import { commitSession } from "~/session.server";
import { getSession } from "~/session.server";

type LoaderData = {
  auth: AuthenticatedUser;
  error?: any;
};

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await authenticator.isAuthenticated(request);

  // check for an error in the session "flash" message
  const session = await getSession(request.headers.get("Cookie"));
  let error = session.get(authenticator.sessionErrorKey);

  // check for the error in the URL, as returned by humanode Oauth2, for example:
  // {
  //   error: "login request denied",
  //   error_description: "You canceled the authentication process",
  //   state: "22222222-eeee-4444-bbbb-888888888888",
  // }
  if (!error) {
    const url = new URL(request.url);
    const uError = [
      url.searchParams.get("error"),
      url.searchParams.get("error_description"),
    ];
    if (uError[0]) error = { message: uError.join(": ") };
  }

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
    <div className="mt-8 grid place-items-center gap-8">
      {data.error && <AlertError>{data.error?.message}</AlertError>}
      <Form action="/auth/humanode" method="post">
        <button className="btn btn-primary">Authenticate with Humanode</button>
      </Form>
    </div>
  );
}
