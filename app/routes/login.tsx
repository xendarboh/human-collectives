import { Form } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  // redirect if user is already authenticated
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
};

export default function Login() {
  return (
    <div>
      <Form action="/auth/humanode" method="post">
        <button>Bioauthenticate with Humanode</button>
      </Form>
    </div>
  );
}
