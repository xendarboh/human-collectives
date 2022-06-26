import { Authenticator } from "remix-auth";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { HumanodeStrategy } from "../src/remix-auth-humanode";
import { createUser } from "~/models/user.server";
import { getUser } from "~/models/user.server";
import { sessionStorage } from "~/session.server";
import { verifyJWT } from "~/utils/jwt.server";

invariant(
  process.env.AUTH_HUMANODE_CLIENT_ID,
  "AUTH_HUMANODE_CLIENT_ID must be set"
);
invariant(
  process.env.AUTH_HUMANODE_CLIENT_SECRET,
  "AUTH_HUMANODE_CLIENT_SECRET must be set"
);
invariant(
  process.env.AUTH_HUMANODE_URI_CALLBACK,
  "AUTH_HUMANODE_URI_CALLBACK must be set"
);

// The AuthenticatedUser type is stored in the session storage to identify the
// authenticated user. It can be the complete user data or a string with a
// token.
export interface AuthenticatedUser {
  id?: string;
  jwt?: string;
  user?: User; // user info from the database
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<AuthenticatedUser>(
  sessionStorage,
  {
    throwOnError: true,
  }
);

const humanodeStrategy = new HumanodeStrategy(
  {
    clientID: process.env.AUTH_HUMANODE_CLIENT_ID,
    clientSecret: process.env.AUTH_HUMANODE_CLIENT_SECRET,
    callbackURL: process.env.AUTH_HUMANODE_URI_CALLBACK,
  },
  async ({ extraParams }) => {
    const id_token = extraParams.id_token.toString();
    const claims = await verifyJWT(id_token);

    if (claims.error) return { error: claims.error };

    // TODO: hash bioid for storage in the database
    const bioid = claims.sub; // humanode identifer
    invariant(bioid, "humanode identifer undefined");

    // retreive user from the database if it exists
    // create user in the database if it does not
    let user = await getUser({ bioid });
    if (!user) user = await createUser({ bioid });
    invariant(user, "user registration failed");

    return {
      id: claims.sub,
      jwt: id_token,
      user,
    };
  }
);

authenticator.use(humanodeStrategy, "humanode");

export async function requireAuthenticatedUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<AuthenticatedUser> {
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
  const failureRedirect = `/login?${searchParams}`;

  const auth = await authenticator.isAuthenticated(request, {
    failureRedirect,
  });

  const jwtClaims = await verifyJWT(auth.jwt || "");

  if (jwtClaims.error) await logout(request, failureRedirect);

  return auth;
}

export const logout = async (request: Request, redirectTo: string = "/") =>
  await authenticator.logout(request, { redirectTo });
