import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
} from "@remix-run/react";

import type { AuthenticatedUser } from "~/auth.server";
import styles from "./tailwind.css";
import { Navbar } from "~/ui/navbar";
import { authenticator } from "~/auth.server";

type LoaderData = {
  auth: AuthenticatedUser;
  env: any;
};

export const loader: LoaderFunction = async ({ request }) =>
  json({
    auth: await authenticator.isAuthenticated(request),
    env: process.env.NODE_ENV,
  });

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Human Collectives",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const { auth, env } = useLoaderData() as LoaderData;
  const matches = useMatches();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {matches[1]?.id !== "routes/index" && (
          <Navbar authenticated={auth !== null} env={env} />
        )}
        <div className="px-10 pt-2">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
