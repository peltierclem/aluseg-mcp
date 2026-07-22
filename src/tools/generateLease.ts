import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { authenticate } from "../security/oauth.js";
import { authorize } from "../security/abac.js";
import { recordAuditEntry } from "../security/auditLog.js";

const inputSchema = {
  property_id: z.string(),
  parties_verified_id: z.string(),
  rent_value: z.number().nonnegative(),
  duration: z.string(),
  oauth_token: z.string(),
};

export function registerGenerateLease(server: McpServer): void {
  server.tool(
    "generate_lease",
    "Draft a standardized rental contract from verified party and property metadata. Always returns a draft for human review — never auto-signs.",
    inputSchema,
    async ({ oauth_token, ...args }) => {
      const user = await authenticate(oauth_token);
      await authorize({ user, toolName: "generate_lease", resourceOwnerId: user.accountId });

      // TODO: call the Aluseg backend's contract-drafting endpoint and
      // return a secure, short-lived URL to an eIDAS-signable PDF draft.
      // This handler must never mark a lease as final/signed itself.
      const result = { draftUrl: null as string | null };

      await recordAuditEntry({
        timestamp: new Date().toISOString(),
        userId: user.userId,
        toolName: "generate_lease",
        input: args,
        outcome: "allowed",
        output: result,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    }
  );
}
