import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";

const server = new McpServer({
  name: "aluseg-mcp",
  version: "0.1.0",
});

// Every tool call passes through the security layer (OAuth2 + ABAC + audit
// log) before reaching a handler — see src/security/. No tool is registered
// without it; there is no "internal" bypass path.
registerTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("aluseg-mcp fatal error:", err);
  process.exit(1);
});
