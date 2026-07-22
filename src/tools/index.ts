import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerVerifyParties } from "./verifyParties.js";
import { registerGenerateLease } from "./generateLease.js";
import { registerNotifyTaxAuthority } from "./notifyTaxAuthority.js";
import { registerProposeUnpaidInsurance } from "./proposeUnpaidInsurance.js";
import { registerGetRentStatus } from "./getRentStatus.js";

export function registerTools(server: McpServer): void {
  registerVerifyParties(server);
  registerGenerateLease(server);
  registerNotifyTaxAuthority(server);
  registerProposeUnpaidInsurance(server);
  registerGetRentStatus(server);
}
