/**
 * Immutable audit logging for GDPR traceability.
 *
 * Every tool call — allowed or denied — must produce one entry here before
 * a result is returned to the AI client. Entries are append-only; this
 * module must never expose an update or delete path.
 */

export interface AuditEntry {
  timestamp: string;
  userId: string;
  toolName: string;
  input: unknown;
  outcome: "allowed" | "denied" | "error";
  output?: unknown;
}

// TODO(security): persist to an append-only store (e.g. a hash-chained log
// table or WORM storage), not a mutable table an operator could edit.
export async function recordAuditEntry(entry: AuditEntry): Promise<void> {
  throw new Error("not implemented: audit log persistence");
}
