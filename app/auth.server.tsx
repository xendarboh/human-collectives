import invariant from "tiny-invariant";
import { Authenticator, AuthorizationError } from "remix-auth";
import { redirect } from "@remix-run/node";

import type { User } from "~/models/user.server";
import { HumanodeStrategy } from "~/auth-humanode.server";
import { commitSession } from "~/session.server";
import { createUser } from "~/models/user.server";
import { getSession } from "~/session.server";
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
// authenticated user.
export interface AuthenticatedUser {
  id: string;
  jwt: string;
  user: User; // from the database
}

// Create an instance of the authenticator, pass a User Type with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<AuthenticatedUser>(
  sessionStorage,
  {
    sessionKey: "sessionKey",
    sessionErrorKey: "sessionErrorKey",
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

    // validate the jwt token
    const claims = await verifyJWT(id_token);
    if (claims.error) throw new AuthorizationError("Authorization Failed");

    // ensure humanode identifier is set
    const bioid = claims.sub; // humanode identifer
    if (!bioid || bioid.length === 0)
      throw new AuthorizationError("Humanode Identifer Missing");

    // retreive user from database if it exists
    // create user in database if does not exist, to "register" the user
    // ensure user exists
    let user = await getUser({ bioid });
    if (!user) user = await createUser({ bioid });
    if (!user) throw new AuthorizationError("User Registration Failed");

    return {
      id: bioid,
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

  // Note: Potentially Dangerous! For development, hack authenticated user to bypass bioauth.
  if (process.env.NODE_ENV === "development") {
    const hackUserId = process.env.DEV_HACK_AUTHENTICATED_USER;
    if (hackUserId && +hackUserId > 0) {
      const filler = "XXXXXXXX";
      return {
        id: filler,
        jwt: filler,
        user: { id: +hackUserId, bioid: filler },
      };
    }
  }

  const auth = await authenticator.isAuthenticated(request, {
    failureRedirect,
  });

  const jwtClaims = await verifyJWT(auth.jwt);

  // if jwt verification fails, like token expiration or otherwise
  // then set a session "flash" message as an error to be shown on the login page
  // and manually clear the authenticated session data to force re-authentication
  if (jwtClaims.error) {
    // https://remix.run/docs/en/v1/api/remix#sessionflashkey-value
    const session = await getSession(request.headers.get("Cookie"));
    session.flash(authenticator.sessionErrorKey, {
      message: jwtClaims.error.message,
    });
    session.unset(authenticator.sessionKey);
    throw redirect(failureRedirect, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return auth;
}

export const logout = async (request: Request, redirectTo: string = "/") =>
  await authenticator.logout(request, { redirectTo });
