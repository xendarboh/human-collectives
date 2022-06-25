import { Authenticator } from "remix-auth";
import { HumanodeStrategy } from "../src/remix-auth-humanode";
import { sessionStorage } from "~/session.server";
import { verifyJWT } from "~/utils/jwt.server";

// The User type is stored in the session storage to identify the authenticated
// user. It can be the complete user data or a string with a token. completely
// configurable.
interface User {
  email?: string;
  error?: any;
  id?: string;
  jwt?: string;
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage, {
  throwOnError: true,
});

const humanodeStrategy = new HumanodeStrategy(
  {
    clientID: process.env.AUTH_HUMANODE_CLIENT_ID || "",
    clientSecret: process.env.AUTH_HUMANODE_CLIENT_SECRET || "",
    callbackURL: process.env.AUTH_HUMANODE_URI_CALLBACK || "",
  },
  async ({ extraParams }) => {
    const id_token = extraParams.id_token.toString();
    const claims = await verifyJWT(id_token);
    return claims.error
      ? { error: claims.error }
      : {
          id: claims.sub,
          jwt: id_token,
        };
  }
);

authenticator.use(humanodeStrategy, "humanode");
