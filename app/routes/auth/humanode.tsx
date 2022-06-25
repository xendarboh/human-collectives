import { authenticator } from "~/auth.server";
import { redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => redirect("/login");

export let action: ActionFunction = ({ request }) =>
  authenticator.authenticate("humanode", request);
