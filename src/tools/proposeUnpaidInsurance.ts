import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { authenticate } from "../security/oauth.js";
import { authorize } from "../security/abac.js";
import { recordAuditEntry } from "../security/auditLog.js";

const inputSchema = {
  tenant_consent_token: z.string(),
  monthly_rent: z.number().nonnegative(),
  oauth_token: z.string(),
};

export function registerProposeUnpaidInsurance(server: McpServer): void {
  server.tool(
    "propose_unpaid_insurance",
    "Assess tenant default risk from consented data and return unpaid-rent insurance quotes.",
    inputSchema,
    async ({ oauth_token, tenant_consent_token, monthly_rent }) => {
      const user = await authenticate(oauth_token);
      await authorize({
        user,
        toolName: "propose_unpaid_insurance",
        resourceOwnerId: user.accountId,
        consentToken: tenant_consent_token,
      });

      // TODO: call the risk-scoring service (PSD2 open-banking data,
      // permitted/consented scope only) and the insurance-partner quote API.
      const result = { riskScore: null as number | null, quotes: [] as unknown[] };

      await recordAuditEntry({
        timestamp: new Date().toISOString(),
        userId: user.userId,
        toolName: "propose_unpaid_insurance",
        input: { monthly_rent },
        outcome: "allowed",
        output: result,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    }
  );
}
