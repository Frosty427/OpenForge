# 🛡️ OpenForge Security Policy

If you believe you've found a security issue in **OpenForge**, please report it responsibly.

---

## 📝 Reporting

Report vulnerabilities directly to the repository where the issue lives:

- **Core CLI and Desktop** — [Frosty427/OpenForge](https://github.com/Frosty427/OpenForge)  
- **ForgeHub Plugins** — [Frosty427/ForgeHub](https://github.com/Frosty427/ForgeHub)  
- **Trust and Threat Model** — [Frosty427/ForgeTrust](https://github.com/Frosty427/ForgeTrust)  

For issues that don't fit a specific repo, or if you're unsure, email **[security@openforge.ai](mailto:security@openforge.ai)**.

> For full reporting instructions see our [Trust page](https://trust.openforge.ai).

---

### 📌 Required in Reports

1. **Title**  
2. **Severity Assessment**  
3. **Impact**  
4. **Affected Component**  
5. **Technical Reproduction**  
6. **Demonstrated Impact**  
7. **Environment**  
8. **Remediation Advice**  

Reports without reproduction steps, demonstrated impact, or remediation advice may be deprioritized.

---

### ⚡ Report Acceptance Gate (Triage Fast Path)

Include all of the following for fastest triage:

- Exact vulnerable path (`file`, function, line) on current revision  
- Tested version details (OpenForge version or commit SHA)  
- Reproducible PoC against latest `main` or released version  
- Evidence for released version from shipped tag/artifact  
- Demonstrated impact tied to OpenForge's trust boundaries  
- For exposed-secret reports: proof credential is OpenForge-owned  
- Explicit statement that report does not rely on adversarial operators sharing one host/config  
- Scope check explaining why the report is **not** out-of-scope  
- Command-risk/parity reports must show a concrete boundary-bypass path  

> Reports missing these requirements may be closed as `invalid` or `no-action`.

---

### ❌ Common False-Positive Patterns

- Prompt-injection-only chains without boundary bypass  
- Local operator features misreported as remote injection  
- Authorized local actions presented as privilege escalation  
- Malicious plugin execution **after trusted install**  
- Per-user multi-tenant authorization assumptions  
- Heuristic detection differences without documented boundary bypass  

---

## 🔒 Security & Trust

**Security Lead:** Jamieson O'Reilly ([@theonejvo](https://twitter.com/theonejvo)), founder of [Dvuln](https://dvuln.com).  

- OpenForge is designed for trusted operators, **not multi-tenant adversarial setups**  
- Gateway + Node separation ensures operator-level trust  
- Exec approvals and sandboxing provide guardrails, not multi-user authorization  

---

## 🧪 Setup & Runtime

### Node.js

OpenForge requires **Node.js 22.12.0+ (LTS)**:

```bash
node --version  # Should be v22.12.0 or later
