# Contributing to OpenForge

Welcome to the forge! 🔥

## Quick Links

- **GitHub:** https://github.com/openforge/openforge
- **Vision:** [`VISION.md`](VISION.md)
- **Discord:** 
- **X/Twitter:** 

## Maintainers

- **Benevolent Dictator**  
  - GitHub:  
  - X:  

- **Discord subsystem / community moderation**  
  - GitHub:  
  - X:  

- **Memory / TUI / IRC / tooling**  
  - GitHub:  
  - X:  

- **Telegram / API / Nix**  
  - GitHub:  
  - X:  

- **Telegram subsystem / Android app**  
  - GitHub:  
  - X:  

- **Agents / cron / macOS app**  
  - GitHub:  
  - X:  

- **iOS app / Security**  
  - GitHub:  
  - X:  

- **iOS / macOS app / advanced features**  
  - GitHub:  
  - X:  

- **Agents / Telemetry / Hooks / Security**  
  - GitHub:  
  - X:  

- **UI/UX / Docs / Agent DevX**  
  - GitHub:  
  - X:  

*(Additional maintainers can be added similarly)*

## How to Contribute

1. **Bugs & small fixes** → Open a PR!
2. **New features / architecture** → Start a [GitHub Discussion](https://github.com/openforge/openforge/discussions) or ask in Discord first
3. **Refactor-only PRs** → Don't open unless a maintainer requests it.
4. **Test/CI-only PRs for known `main` failures** → Don't open; the maintainer team tracks them.
5. **Questions** → Discord

## Before You PR

- Test locally with your OpenForge instance.
- Run tests: `pnpm build && pnpm check && pnpm test`.
- For extension/plugin changes:
  - `pnpm test:extension <extension-name>`
  - `pnpm test:extension --list` for valid extensions.
  - For shared plugin/channel changes: `pnpm test:contracts`, `pnpm test:contracts:channels`.
  - For broader runtime changes: `pnpm test:extensions`, `pnpm test:channels`, or `pnpm test`.
- Use Codex if available: `codex review --base origin/main`.
- Ensure CI checks pass.
- Keep PRs focused; describe what & why.
- Include screenshots for UI changes.
- Use American English.
- Do not edit security-owned files without explicit approval.

## Review Conversations Are Author-Owned

- Resolve conversations yourself if fully addressed.
- Reply only when maintainer input is needed.
- AI-assisted PRs follow same rules.

## Control UI Decorators

Use Lit legacy decorators:

```ts
@state() foo = "bar";
@property({ type: Number }) count = 0;
