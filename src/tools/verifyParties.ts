import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { authenticate } from "../security/oauth.js";
import { recordAuditEntry } from "../security/auditLog.js";

const inputSchema = {
  landlord_nif: z.string(),
  tenant_nif: z.string(),
  oauth_token: z.string(),
};

export function registerVerifyParties(server: McpServer): void {
  server.tool(
    "verify_parties",
    "Authenticate and verify the identity of the landlord and tenant.",
    inputSchema,
    async ({ landlord_nif, tenant_nif, oauth_token }) => {
      const user = await authenticate(oauth_token);

      // TODO: call the Aluseg backend's identity-verification endpoint,
      // scoped to `user.accountId`, and parse any eIDAS signature present.
      const result = { verified: false, amlFlags: [] as string[] };

      await recordAuditEntry({
        timestamp: new Date().toISOString(),
        userId: user.userId,
        toolName: "verify_parties",
        input: { landlord_nif, tenant_nif },
        outcome: "allowed",
        output: result,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    }
  );
}
