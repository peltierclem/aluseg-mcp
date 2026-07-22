import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { authenticate } from "../security/oauth.js";
import { authorize } from "../security/abac.js";
import { recordAuditEntry } from "../security/auditLog.js";

const inputSchema = {
  signed_contract_hash: z.string(),
  at_credentials_token: z.string(),
  oauth_token: z.string(),
  consent_token: z.string(),
};

export function registerNotifyTaxAuthority(server: McpServer): void {
  server.tool(
    "notify_tax_authority",
    "Submit a signed lease to the Portuguese Tax and Customs Authority (AT). Requires explicit, time-bounded landlord consent.",
    inputSchema,
    async ({ oauth_token, consent_token, ...args }) => {
      const user = await authenticate(oauth_token);
      await authorize({
        user,
        toolName: "notify_tax_authority",
        resourceOwnerId: user.accountId,
        consentToken: consent_token,
      });

      // TODO: call the Aluseg backend's AT registration endpoint. Must be
      // idempotent — a retried agent call must not double-file the lease.
      const result = { receiptId: null as string | null, taxId: null as string | null };

      await recordAuditEntry({
        timestamp: new Date().toISOString(),
        userId: user.userId,
        toolName: "notify_tax_authority",
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
