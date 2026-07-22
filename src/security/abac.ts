/**
 * Attribute-based access control for sensitive tools.
 *
 * Authentication answers "who is calling"; this answers "is this specific
 * call allowed", evaluated against contextual attributes — not just
 * session validity. Required before any write/action tool executes
 * (generate_lease, notify_tax_authority, propose_unpaid_insurance).
 */

import type { AuthenticatedUser } from "./oauth.js";

export interface AbacContext {
  user: AuthenticatedUser;
  toolName: string;
  resourceOwnerId?: string;
  consentToken?: string;
}

export class AccessDeniedError extends Error {}

// TODO(security): implement the actual policy. Minimum bar before this
// stops throwing:
//  - resourceOwnerId must match user.accountId (no cross-account access)
//  - tools marked requiresConsent in spec/tools.json must carry a valid,
//    unexpired consentToken
//  - tools marked requiresHumanConfirmation must not be callable from a
//    fully autonomous agent loop without an explicit confirmation step
//    surfaced back to the human user
export async function authorize(ctx: AbacContext): Promise<void> {
  throw new Error("not implemented: abac policy evaluation");
}
