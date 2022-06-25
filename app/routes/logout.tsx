import { authenticator } from "~/auth.server";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = async ({ request }) =>
  await authenticator.logout(request, { redirectTo: "/login" });
