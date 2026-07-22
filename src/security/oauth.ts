/**
 * Per-user OAuth 2.0 token validation.
 *
 * Every tool call must present a bearer token scoped to exactly one
 * landlord or tenant. There is intentionally no notion of a global/shared
 * service credential here — see README "Security & privacy model".
 */

export interface AuthenticatedUser {
  userId: string;
  accountId: string;
  role: "landlord" | "tenant" | "agency";
}

export class AuthenticationError extends Error {}

// TODO(security): wire to the Aluseg backend's OAuth 2.0 token introspection
// endpoint. Must reject expired, revoked, or wrong-audience tokens before
// any tool handler runs.
export async function authenticate(oauthToken: string): Promise<AuthenticatedUser> {
  throw new Error("not implemented: oauth token validation");
}
