import { jwtVerify, createRemoteJWKSet } from "jose";

export const verifyJWT = async (token: string) => {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(process.env.AUTH_HUMANODE_URI_JWKS || ""),
      {
        cacheMaxAge: 600000,
        cooldownDuration: 30000,
      }
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.AUTH_HUMANODE_URI_ISSUER,
      audience: process.env.AUTH_HUMANODE_CLIENT_ID,
      algorithms: ["RS256"],
    });

    return payload;
  } catch (error) {
    return { error };
  }
};
