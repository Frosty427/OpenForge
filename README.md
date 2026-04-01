# ⚡ OpenForge — The AI That Operates Your Computer

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-BETA-ff4444?style=for-the-badge&labelColor=0d0d0d" alt="Status">
  <img src="https://img.shields.io/github/v/release/Frosty427/OpenForge?include_prereleases&style=for-the-badge&color=00d4ff&labelColor=0d0d0d" alt="Release">
  <img src="https://img.shields.io/badge/License-GPL%20v3-7c3aed?style=for-the-badge&labelColor=0d0d0d" alt="License">
  <img src="https://img.shields.io/github/issues/Frosty427/OpenForge?style=for-the-badge&color=ff6b00&labelColor=0d0d0d" alt="Issues">
</p>

<p align="center">
  <strong>Not just an assistant. An operator.</strong><br/>
  <sub>Built with Electron · React · TypeScript</sub>
</p>

<p align="center">
  <a href="#">Website</a> ·
  <a href="#">Documentation</a> ·
  <a href="#-vision">Vision</a> ·
  <a href="#-installation">Get Started</a> ·
  <a href="#-contributing">Contribute</a>
</p>

---

**OpenForge** is a next-generation AI desktop assistant that doesn't just respond — it **acts**. It bridges the gap between large language models and real system operations, translating natural language into direct, executable commands on your machine.

> Inspired by the vision of Jarvis. Built for the present.

---

## ⚡ Why OpenForge?

Most AI tools talk. **OpenForge does.**

Traditional AI wrappers stop at conversation. OpenForge goes further — serving as a true **control plane for your operating system**. Ask it to open apps, kill processes, clean folders, run scripts. It just works.

---

## ✨ Features

### 🧠 Multi-AI Provider Support
Switch between the world's best models on the fly:
- **OpenAI** — GPT-4o, GPT-4, GPT-3.5
- **Anthropic** — Claude 3.5 Sonnet, Claude 3 Opus
- **OpenRouter** — Hundreds of models, one interface
- **Ollama** — Local, private, fully offline LLMs

### 💻 Real System Control
OpenForge is not a chatbot. It's an operator:
- **Natural Language Execution** — `"Open VS Code"`, `"Kill the node process"`, `"Clear temp files"`
- **Direct Command Mode** — Use `/exec` for raw terminal control:
  ```bash
  /exec git pull && npm run build
  ```
- **Permission-Scoped Architecture** — Every action is deliberate, not accidental.

### ⌨️ Instant Global Access
No windows to switch. No tabs to hunt. Just press:
```
Alt + Space
```
A floating command center appears — wherever you are, whatever you're doing.

### 🎨 Interface Built for Focus
Dark, minimal, and fast:
- Hardware-accelerated animations
- Distraction-free chat experience
- Designed for deep work, not decoration

### 🧩 Modular & Extensible
The architecture is built to grow:
- Custom command plugins
- File system & web browsing tool integrations
- Agentic workflow support on the roadmap

---

## 🛣️ Roadmap

| Status | Feature |
|--------|---------|
| ✅ | Core Electron app with window management & hotkeys |
| ✅ | Multi-provider AI support (OpenAI, Anthropic, Ollama) |
| ⬜ | Settings UI — in-app API key & preference management |
| ⬜ | Vision integration — screen context awareness |
| ⬜ | Safety sandbox — confirmations before critical executions |
| ⬜ | Plugin system — community extensions for VSCode, Chrome, etc. |
| ⬜ | Local RAG — chat with your own documents, fully private |

---

## 📦 Installation

**Prerequisites:**
- Node.js `v18+`
- `npm`, `pnpm`, or `yarn`

```bash
# Clone the repository
git clone https://github.com/Frosty427/OpenForge.git

# Navigate into the project
cd OpenForge

# Install dependencies
npm install
```

---

## 🚀 Usage

### Development Mode
Live reload for active development:
```bash
npm run dev
```

### Production Build
Compile for your OS:
```bash
npm run build
```
Output is generated in the `dist/` or `release/` directory.

---

## 🧠 Vision

OpenForge is the foundation of something larger:

- **AI Agents** — Autonomous, multi-step task execution on your machine
- **Automation Systems** — Complex workflows triggered by a single sentence
- **Hybrid Intelligence** — Seamlessly combine local and cloud AI
- **OS Control Layer** — A fully programmable AI interface for your desktop

The goal isn't a smarter chatbot. It's an AI that has hands.

---

## ⚙️ Configuration

AI providers are currently configured directly in the codebase.

**Coming soon:**
- Settings dashboard with live provider switching
- Encrypted API key storage
- Per-session model selection

---

## 🤝 Contributing

OpenForge is open to contributors at every level. Bug fixes, features, docs — all welcome.

1. **Fork** the repository
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a **Pull Request**

---

## 📜 License

Licensed under the **GNU General Public License v3.0**.
See [LICENSE](https://www.gnu.org/licenses/gpl-3.0.en.html) for details.

---

<p align="center">
  <strong>OpenForge</strong> — The beginning of AI that doesn't just think, but <em>does</em>.
</p>
