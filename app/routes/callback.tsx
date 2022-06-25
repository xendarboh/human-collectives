// TODO: move to app/routes/auth/humanode/callback
import { authenticator } from "~/auth.server";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("humanode", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
