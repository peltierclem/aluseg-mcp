import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { authenticate } from "../security/oauth.js";
import { recordAuditEntry } from "../security/auditLog.js";

const inputSchema = {
  property_id: z.string(),
  period: z.string(),
  oauth_token: z.string(),
};

export function registerGetRentStatus(server: McpServer): void {
  server.tool(
    "get_rent_status",
    "Read rent-payment status for a property over a given period. Read-only, scoped to the authenticated user's properties.",
    inputSchema,
    async ({ oauth_token, property_id, period }) => {
      const user = await authenticate(oauth_token);

      // TODO: call the Aluseg backend, scoped to user.accountId — must
      // 404/403 rather than leak status for a property this user doesn't own.
      const result = { status: "pending" as "paid" | "pending" | "overdue", amount: 0 };

      await recordAuditEntry({
        timestamp: new Date().toISOString(),
        userId: user.userId,
        toolName: "get_rent_status",
        input: { property_id, period },
        outcome: "allowed",
        output: result,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    }
  );
}
