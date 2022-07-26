// TODO: move to app/routes/auth/humanode/callback
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { authenticator } from "~/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
  // if errors in the callback url, forward them to be shown on the login page
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return redirect(`/login${url.search}`);

  return authenticator.authenticate("humanode", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
