# 🚀 OpenForge Vision

---

## 🧩 Skills

- Bundled skills exist for baseline UX  
- New skills should first publish to **ForgeHub** (our plugin marketplace)  
- Core skill additions are rare and require strong product or security reasons  

---

## ⚙️ AI Provider & MCP Support

- OpenForge supports **multi-AI workflows** and **multi-provider orchestration**  
- Local AI execution is fully supported  
- MCP integration (if needed) is optional and decoupled to reduce core churn  

---

## 🧪 Setup

- **Terminal-first design** ensures explicit setup  
- Users see docs, permissions, and security posture upfront  
- Long-term: easier onboarding flows will complement security  

````bash
# Example setup commands (GitHub-friendly code block)
git clone https://github.com/Frosty427/OpenForge.git
cd OpenForge
npm install
npm run dev
````
# 💻 Why TypeScript?

OpenForge is an orchestration system for prompts, tools, protocols, and integrations.
TypeScript ensures:

Hackable by default

Fast iteration

Readable, modifiable, and extendable code

🚫 What We Will Not Merge (For Now)

Core skills that can live in ForgeHub

Full translations for all docs (AI-generated translations planned)

Commercial integrations outside AI provider category

Wrapper channels without real capability or security gap

Heavy orchestration layers duplicating existing infrastructure

These guardrails are flexible — strong demand + technical rationale can override them.
