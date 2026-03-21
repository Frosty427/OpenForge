# *OpenForge Repository Guidelines*

**Repo:** _https://github.com/openforge/openforge_  
**File references:** _always repo-root relative_ (example: `extensions/bluebubbles/src/channel.ts:80`)  
**Security-sensitive files:** do **not** edit paths under `CODEOWNERS` unless explicitly requested  

---

## *Project Structure & Modules*

- **Source:** `src/`  
  - CLI: `src/cli`  
  - Commands: `src/commands`  
  - Web provider: `src/provider-web.ts`  
  - Infrastructure: `src/infra`  
  - Media pipeline: `src/media`  

- **Tests:** colocated `*.test.ts`  
- **Docs:** `docs/` → built output in `dist/`  
- **Plugins:** `extensions/*`  
  - Plugin-only dependencies → plugin `package.json`  
  - Install: `npm install --omit=dev`  
  - Runtime dependencies → `dependencies` only  
  - `openforge` → `devDependencies` / `peerDependencies`  

- **Imports:** only `openforge/plugin-sdk/*` + local barrels (`api.ts`, `runtime-api.ts`)  
- **Installers:** `https://openforge.ai/*` (repo: `../openforge.ai`)  
- **Channels:** consider **all core + extension channels**  
  - Core docs: `docs/channels/`  
  - Core code: `src/telegram`, `src/discord`, `src/slack`, `src/signal`, `src/imessage`, `src/web`, `src/channels`, `src/routing`  
  - Extensions: `extensions/*` (`msteams`, `matrix`, `zalo`, `voice-call`)  

---

## *Docs (Mintlify)*

- Hosted: [docs.openforge.ai](https://docs.openforge.ai)  
- Internal links: **root-relative**, no `.md/.mdx`  
- Alphabetical order for services unless runtime order matters  
- Avoid em-dashes/apostrophes in headings  
- Use full URLs when requested  

---

## *i18n (zh-CN)*

- Generated: `docs/zh-CN/**`  
- Pipeline: English → glossary → `scripts/docs-i18n` → targeted fixes  
- Coverage check: `pnpm docs:check-i18n-glossary`  
- Slow? Ping *@jospalmbier* on Discord  

---

## *Build / Test / Development*

- Node 22+  
- Install dependencies: `pnpm install`  
- Pre-commit hooks: `prek install`  
- Bun for TypeScript execution: `bun <file.ts>` / `bunx <tool>`  
- Dev CLI: `pnpm openforge ...` or `pnpm dev`  
- Type-check/build: `pnpm build`, `pnpm tsgo`  
- Lint/format: `pnpm check`, `pnpm format:fix`  
- Tests: `pnpm test`, coverage: `pnpm test:coverage`  

---

## *Coding Style & Naming*

- Language: TypeScript (ESM), strict typing, avoid `any`  
- Lint/format via Oxlint / Oxfmt  
- Dynamic imports → use `*.runtime.ts` boundaries  
- Extension self-import → local barrels only  
- Keep files <700 LOC preferred  
- Naming: **OpenForge** = product/docs/UI, `openforge` = CLI/package/paths/config  

---

## *Release / Advisory*

- `$openforge-release-maintainer` → release auth, changelog  
- `$openforge-ghsa-maintainer` → GHSA advisory validation  
- Explicit approval required  

---

## *Testing Guidelines*

- Vitest, coverage ≥70%  
- Naming: `*.test.ts` / `*.e2e.test.ts`  
- Local debug: `pnpm test -- <path-or-filter>`  
- Live tests: `OPENFORGE_LIVE_TEST=1 pnpm test:live`  
- Docker tests: `pnpm test:docker:*`  
- Changelog: append only, 1 contributor per line  
