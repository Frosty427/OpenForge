# OpenForge - AI Desktop Assistant

OpenForge is an advanced, AI-powered desktop assistant built with Electron, React, and TypeScript. Inspired by Jarvis, it integrates seamlessly with your operating system to provide intelligent control and assistance.

## Features

- **Global Hotkey:** Summon OpenForge instantly with `Alt + Space`.
- **AI Integration:** Supports OpenAI, Anthropic, OpenRouter, and Local LLMs (via Ollama).
- **System Control:** Execute system commands directly from the chat interface (e.g., `/exec notepad`).
- **Modern UI:** Sleek, dark-themed, and animated interface.

## Installation

```bash
git clone https://github.com/Frosty427/OpenForge.git
cd OpenForge
npm install
```

## Usage

### Development Mode
To start the application in development mode with hot-reloading:

```bash
npm run dev
```

### Production Build
To build the application for your OS:

```bash
npm run build
```

The executable will be located in the `dist` or `release` folder.

## Configuration

AI settings can be configured directly in the code (for now) or through future settings UI updates.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

# Note

This project is under development (BETA)

## License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)
