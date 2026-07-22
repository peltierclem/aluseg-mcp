# Aluseg MCP Server

**An open-source, self-hostable [Model Context Protocol](https://modelcontextprotocol.io) server for rental management.**

Aluseg MCP lets AI assistants (Claude, local LLMs, custom agentic workflows) securely interact with a landlord's own rental data — leases, rent status, tenant records, tax-authority filings — through a standard, auditable interface, instead of ad hoc scraping or fragile custom integrations.

It is built **security- and privacy-first**: every tool call is made on behalf of one authenticated user, scoped to exactly that user's permissions, and recorded in an immutable audit log — never through a single over-privileged service account.

> **Status:** Early development. The tool specification and reference implementation are under active work. See the [roadmap](#roadmap).

**License:** [AGPL-3.0](LICENSE) · **Standard:** Model Context Protocol (JSON-RPC 2.0)

---

## Why this exists

Rental-management platforms today are closed boxes. Landlords who want their AI assistant to answer *"which of my tenants are late on rent this month?"* or *"draft a lease for this new tenant"* have no clean, safe way to connect it — the data is locked behind a web UI with no API, or behind a closed, paywalled one never designed for AI agents.

At the same time, most Model Context Protocol servers connect to business systems using a **single master service account** — convenient for a developer's laptop, but unacceptable for a multi-tenant SaaS handling regulated personal and financial data. One leaked token, and an AI agent can read or act on *every* account.

**Aluseg MCP addresses both gaps:**

- **Open & self-hostable.** Released under AGPL-3.0 as a standalone, containerized service. Any landlord, property manager, or developer can run it against their own data — independent of Aluseg's hosted infrastructure. No vendor lock-in.
- **Per-user authority, not a master key.** The AI agent authenticates as a specific user via OAuth 2.0 and can only ever do what that user is allowed to do.
- **Safe by default on regulated actions.** High-stakes tools (generating a legal contract, filing with the tax authority, initiating a payment) are gated by attribute-based access control and explicit, human-in-the-loop consent.

---

## Architecture

Aluseg MCP is a **decoupled gateway**. It exposes MCP tools to AI clients and translates them into authenticated calls against a rental-management backend — it never talks to a database directly, and it holds no platform-wide credentials.

```
+-----------------------------------------------------------------------+
|                            LLM / AI Client                            |
|          (Claude Desktop, Cursor, custom agentic workflows)           |
+-----------------------------------------------------------------------+
                                   |
                                   | JSON-RPC 2.0 (stdio / SSE)
                                   v
+-----------------------------------------------------------------------+
|                         Aluseg MCP Server                             |
|   - Exposes tools to AI agents (verify_parties, generate_lease, ...)  |
|   - Stateless, containerized, self-hostable (OCI image)               |
|   - Per-user OAuth 2.0 auth + ABAC policy + immutable audit log       |
+-----------------------------------------------------------------------+
                                   |
                                   | Authenticated HTTPS (user-scoped token)
                                   v
+-----------------------------------------------------------------------+
|                    Rental-management backend API                      |
|   (Aluseg SaaS, or any backend implementing the open tool schema)     |
+-----------------------------------------------------------------------+
```

Because the server is decoupled and stateless, it can run anywhere — a landlord's own machine, a small VPS, or alongside the backend — supporting data portability rather than central dependency.

---

## Exposed tools

The server exposes a small, deliberately-scoped set of tools. Each carries an explicit privacy/security constraint.

| Tool | Purpose | Key inputs | Constraint |
|------|---------|-----------|------------|
| `verify_parties` | Verify the identity of landlord and tenant | `landlord_nif`, `tenant_nif` | Requires OAuth 2.0 auth; parses eIDAS digital signatures |
| `generate_lease` | Draft a standardized rental contract from verified metadata | `property_id`, `parties_id`, `rent_value`, `duration` | Restricted to verified owners; returns a signable draft, **never** auto-executes |
| `notify_tax_authority` | File a lease with the tax authority (AT) | `signed_contract_hash` | Requires active, explicit, time-bounded user consent |
| `propose_unpaid_insurance` | Assess default risk and propose rent-default insurance | `tenant_consent_token`, `monthly_rent` | Requires explicit, time-bounded consent; GDPR-compliant, uses only permitted data |
| `get_rent_status` | Read rent-payment status for a property/period | `property_id`, `period` | Read-only; scoped to the authenticated user's properties |

> Read-only tools resolve to data the user can already see. Write/action tools (`generate_lease`, `notify_tax_authority`) produce drafts or require human confirmation — the agent proposes, the human commits.

The full machine-readable tool schema lives in [`spec/`](spec/) and is intended to be an **open standard** other rental backends can implement, so PropTech developers can build interoperable tools instead of reinventing incompatible integrations.

---

## Security & privacy model

This is the core of the project, not an afterthought.

- **User-level OAuth 2.0 delegation.** The AI agent never operates under a global API key. It presents a token tied to one landlord or tenant; the server validates it and enforces that the agent can only touch resources that specific user is authorized for.
- **Attribute-based access control (ABAC).** Before executing a sensitive tool, the server evaluates contextual attributes (user role, document sensitivity, consent state) — not just "is this user logged in."
- **Human-in-the-loop on irreversible actions.** Issuing a legal contract or initiating a payment always requires an explicit confirmation step. The agent cannot autonomously execute legally or financially binding actions.
- **Immutable audit logging.** Every tool call records the user identity, tool name, input parameters, and returned data in a tamper-evident log — supporting GDPR traceability and accountability.
- **Data minimization.** Tools return only what the task requires; risk assessment uses permitted, consented data only.

---

## Getting started

> ⚠️ Not yet ready for production use. These instructions describe the target developer setup.

```bash
# Clone
git clone https://github.com/peltierclem/aluseg-mcp.git
cd aluseg-mcp

# Configure (backend URL + OAuth client credentials)
cp .env.example .env
$EDITOR .env

# Run with Docker
docker compose up

# ...or run locally
npm install
npm run dev
```

Then register the server with your MCP client (e.g. Claude Desktop) by pointing it at the server's stdio command or SSE endpoint. See [`docs/clients.md`](docs/clients.md) *(coming soon)*.

---

## Roadmap

- [ ] Publish the open MCP tool specification (`spec/`)
- [ ] Reference server: JSON-RPC transport (stdio + SSE)
- [ ] OAuth 2.0 per-user authentication
- [ ] ABAC policy engine for sensitive tools
- [ ] Immutable audit logging
- [ ] Read-only tools (`get_rent_status`, party lookups)
- [ ] Action tools with human-in-the-loop (`generate_lease`, `notify_tax_authority`)
- [ ] Containerized release (OCI image) + self-hosting guide
- [ ] Submit to public MCP server directories

---

## Contributing

Contributions, issues, and discussion are welcome. Please open an issue to discuss significant changes before submitting a pull request. By contributing, you agree your contributions are licensed under AGPL-3.0.

---

## License

Licensed under the **GNU Affero General Public License v3.0** — see [LICENSE](LICENSE).

AGPL-3.0 is deliberate: because this is a network service, anyone who runs a modified version as a hosted service must also publish their modifications. This keeps the MCP server and its security patterns an open commons, while leaving separate backend implementations that merely *call* this server over the network unaffected.

---

## Acknowledgements

This work is developed in the context of the [Next Generation Internet](https://ngi.eu) initiative, which supports an open, trustworthy, and human-centric internet.
