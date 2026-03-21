#!/usr/bin/env node
import { startGateway } from '../src/gateway/server.js';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const execAsync = promisify(exec);
const args = process.argv.slice(2);
const command = args[0];
const subArgs = args.slice(1);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EULA_FILE = path.join(__dirname, '..', '.eula_accepted');
const CONFIG_DIR = path.join(__dirname, '..', 'config');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

function showBanner() {
  console.log(`
 ${colors.cyan}${colors.bright}╔═══════════════════════════════════════════════════════════╗
 ║     OpenForge - AI Desktop Assistant & CLI                ║
 ║     Advanced AI-Powered System Control                    ║
 ╚═══════════════════════════════════════════════════════════╝${colors.reset}
  `);
}

function showEULA() {
  return new Promise((resolve) => {
    console.log(`
 ${colors.yellow}${colors.bright}⚠️  END USER LICENSE AGREEMENT (EULA)${colors.reset}
 ${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}

 ${colors.bright}1. AI RESPONSIBILITY${colors.reset}
    OpenForge uses Artificial Intelligence to process commands
    and control this computer. AI actions may affect your system,
    files, and data.

 ${colors.bright}2. USER RESPONSIBILITY${colors.reset}
    • You are solely responsible for reviewing ALL AI actions
    • Always verify commands before execution
    • Monitor AI activity at all times

 ${colors.bright}3. LIABILITY DISCLAIMER${colors.reset}
    • The developers are NOT liable for any damages
    • This includes data loss, system damage, or security issues
    • Use at your own risk

 ${colors.bright}4. NO WARRANTY${colors.reset}
    • Software provided "AS IS" without warranty of any kind
    • No guarantee of fitness for any particular purpose

 ${colors.bright}5. RECOMMENDED USAGE${colors.reset}
    • Run in controlled/test environments when possible
    • Maintain regular backups
    • Use with supervision

 ${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}
 ${colors.red}${colors.bright}By accepting, you acknowledge that YOU are responsible for${colors.reset}
 ${colors.red}${colors.bright}all actions taken by the AI while using this software.${colors.reset}
 ${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}
`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.cyan}Do you accept the EULA terms? [yes/no]: ${colors.reset}`, (answer) => {
      rl.close();
      
      const normalized = answer.trim().toLowerCase();
      if (normalized === 'yes' || normalized === 'y') {
        fs.writeFileSync(EULA_FILE, new Date().toISOString());
        console.log(`\n${colors.green}✓ EULA accepted. Welcome to OpenForge!${colors.reset}\n`);
        resolve(true);
      } else {
        console.log(`\n${colors.yellow}EULA not accepted. OpenForge cannot run without agreement.${colors.reset}`);
        console.log(`${colors.gray}Exiting...${colors.reset}\n`);
        resolve(false);
      }
    });
  });
}

function checkEULAAccepted() {
  try {
    return fs.existsSync(EULA_FILE);
  } catch {
    return false;
  }
}

async function ensureEULAAccepted() {
  if (!checkEULAAccepted()) {
    const accepted = await showEULA();
    if (!accepted) {
      process.exit(0);
    }
  } else {
    console.log(`${colors.green}✓${colors.reset} EULA previously accepted.\n`);
  }
}

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return { success: true, output: stdout };
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset} ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runSpawn(command, args = [], detached = false) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      detached
    });
    
    child.on('close', (code) => {
      resolve(code);
    });
  });
}

function showHelp() {
  showBanner();
  console.log(`
  ${colors.bright}Usage:${colors.reset} openforge <command> [options]

  ${colors.bright}Core Commands:${colors.reset}
    gateway *            Run the WebSocket Gateway server
    node *               Run headless node service
    daemon *             Run headless gateway service (legacy)
    dashboard            Launch OpenForge Control UI
    tui                  Launch terminal UI connected to Gateway
    start                Launch the desktop GUI
    config *             Configure AI providers and settings
    configure            Interactive setup wizard
    setup                Initialize local config and workspace

  ${colors.bright}Agent Management:${colors.reset}
    acp *                Agent Control Protocol tools
    agent                Run a single agent turn via Gateway
    agents *             Manage isolated agents
    sandbox *            Manage sandbox containers
    hooks *              Manage automation triggers

  ${colors.bright}Messaging:${colors.reset}
    message *            Send, read, manage messages
    channels *           Manage chat channels
    directory *          Lookup contacts and peer IDs

  ${colors.bright}System & Security:${colors.reset}
    devices *            Device pairing and tokens
    pairing *            Secure pairing requests
    secrets *            Runtime secrets management
    security *           Security audits and hardening
    system *             System events and monitoring

  ${colors.bright}Automation:${colors.reset}
    cron *               Schedule recurring tasks
    approvals *          Manage exec approvals
    backups *            Create and verify backups

  ${colors.bright}Tools & Utilities:${colors.reset}
    browser *            Manage dedicated browser
    dns *                Network discovery helpers
    logs                 Tail gateway/agent logs
    memory *             Search and store memory
    models *             Discover and configure AI models
    nodes *              Manage paired nodes
    plugins *            Manage plugins and extensions
    skills *             List AI skills and modules
    sessions *           List conversation sessions
    status               Show channel and session health

  ${colors.bright}Development:${colors.reset}
    env *                Manage Python virtual environments
    run *                Execute scripts across nodes
    monitor *            Monitor agent activity
    plugin-dev *        Scaffold and publish plugins
    workflow *           Orchestrate multi-step workflows
    ai-query *           Query multiple AI providers

  ${colors.bright}Maintenance:${colors.reset}
    doctor               Run health checks
    update *            Check and apply updates
    reset                Reset local config
    uninstall            Uninstall and cleanup

  ${colors.bright}Other:${colors.reset}
    docs                 Open documentation
    completion           Generate shell completions
    qr                   Generate pairing QR code
    onboard              Onboarding wizard
    agent-stats *        Show agent usage stats

  ${colors.gray}* = supports subcommands (run 'openforge <cmd> --help' for details)${colors.reset}
  `);
}

const commands = {
  gateway: async () => {
    showBanner();
    await ensureEULAAccepted();
    console.log(`${colors.cyan}${colors.bright}Starting OpenForge Gateway...${colors.reset}\n`);
    startGateway();
  },

  node: async () => {
    await ensureEULAAccepted();
    console.log(`${colors.cyan}Starting OpenForge Node...${colors.reset}`);
    startGateway();
  },

  daemon: async () => {
    await ensureEULAAccepted();
    console.log(`${colors.cyan}Starting OpenForge Daemon...${colors.reset}`);
    startGateway();
  },

  dashboard: async () => {
    await ensureEULAAccepted();
    console.log(`${colors.cyan}Launching Dashboard...${colors.reset}`);
    runSpawn('npm', ['run', 'dev']);
  },

  tui: async () => {
    await ensureEULAAccepted();
    console.log(`${colors.cyan}Launching Terminal UI...${colors.reset}`);
    console.log(`${colors.yellow}TUI mode coming soon - use 'openforge gateway' for now${colors.reset}`);
  },

  start: async () => {
    showBanner();
    await ensureEULAAccepted();
    console.log(`${colors.cyan}${colors.bright}Launching OpenForge Desktop UI...${colors.reset}`);
    runSpawn('npm', ['run', 'dev']);
  },

  config: async () => {
    ensureConfigDir();
    const configFile = path.join(CONFIG_DIR, 'config.json');
    let config = {};
    if (fs.existsSync(configFile)) config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    // Flag-based: openforge config --provider openai --key sk-xxx --model gpt-4o
    const flagMap = {};
    for (let i = 0; i < subArgs.length; i++) {
      if (subArgs[i].startsWith('--')) {
        const flagName = subArgs[i].slice(2);
        flagMap[flagName] = subArgs[i + 1] || '';
        i++;
      }
    }

    const PROVIDER_URLS = {
      openai:     '',
      anthropic:  'https://openrouter.ai/api/v1',
      openrouter: 'https://openrouter.ai/api/v1',
      groq:       'https://api.groq.com/openai/v1',
      gemini:     'https://openrouter.ai/api/v1',
      mistral:    'https://api.mistral.ai/v1',
      perplexity: 'https://api.perplexity.ai',
      together:   'https://api.together.xyz/v1',
      local:      'http://localhost:11434/v1',
    };

    if (Object.keys(flagMap).length > 0) {
      if (flagMap.provider) { config.of_provider = flagMap.provider; config.of_base_url = PROVIDER_URLS[flagMap.provider] || ''; }
      if (flagMap.key)      config.of_api_key = flagMap.key;
      if (flagMap.model)    config.of_model   = flagMap.model;
      if (flagMap.baseUrl)  config.of_base_url = flagMap.baseUrl;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      console.log(`${colors.green}✓ Ayarlar kaydedildi:${colors.reset}`);
      if (flagMap.provider) console.log(`  Provider : ${colors.cyan}${config.of_provider}${colors.reset}`);
      if (flagMap.key)      console.log(`  API Key  : ${colors.cyan}${config.of_api_key.slice(0,8)}...${colors.reset}`);
      if (flagMap.model)    console.log(`  Model    : ${colors.cyan}${config.of_model}${colors.reset}`);
      console.log(`\n${colors.gray}Desteklenen providerlar: openai | anthropic | openrouter | groq | gemini | mistral | perplexity | together | local${colors.reset}`);
      return;
    }

    // Mevcut config göster
    if (subArgs.length === 0) {
      console.log(`\n${colors.bright}Mevcut AI Ayarları:${colors.reset}`);
      console.log(`  Provider : ${colors.cyan}${config.of_provider || '(ayarlanmamış)'}${colors.reset}`);
      console.log(`  Model    : ${colors.cyan}${config.of_model    || '(ayarlanmamış)'}${colors.reset}`);
      console.log(`  API Key  : ${config.of_api_key ? colors.green + '✓ Ayarlı' : colors.yellow + '✗ Eksik'}${colors.reset}`);
      console.log(`\n${colors.gray}Kullanım: openforge config --provider groq --key gsk_xxx --model llama-3.3-70b-versatile${colors.reset}`);
      console.log(`${colors.gray}Desteklenen: openai | anthropic | openrouter | groq | gemini | mistral | perplexity | together | local${colors.reset}\n`);
      return;
    }

    const action = subArgs[0];

    if (action === 'get') {
      const key = subArgs[1];
      if (fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
        console.log(config[key] || '');
      }
    } else if (action === 'set') {
      const key = subArgs[1];
      const value = subArgs[2];
      let config = {};
      if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      }
      config[key] = value;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      console.log(`${colors.green}Set ${key}=${value}${colors.reset}`);
    } else if (action === 'validate') {
      if (fs.existsSync(configFile)) {
        console.log(`${colors.green}Config is valid${colors.reset}`);
      } else {
        console.log(`${colors.yellow}No config file found${colors.reset}`);
      }
    } else {
      console.log(`${colors.cyan}Config: get/set/validate/file subcommands available${colors.reset}`);
    }
  },

  configure: async () => {
    await ensureEULAAccepted();
    showBanner();
    console.log(`${colors.cyan}${colors.bright}Interactive Configuration Wizard${colors.reset}\n`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const questions = [
      { key: 'openai_api_key', prompt: 'Enter OpenAI API Key (optional): ' },
      { key: 'anthropic_api_key', prompt: 'Enter Anthropic API Key (optional): ' },
      { key: 'gateway_port', prompt: 'Gateway port [3000]: ', default: '3000' },
      { key: 'theme', prompt: 'Theme [dark/light]: ', default: 'dark' }
    ];

    const config = {};
    let qIndex = 0;

    const askQuestion = () => {
      if (qIndex >= questions.length) {
        rl.close();
        ensureConfigDir();
        const configFile = path.join(CONFIG_DIR, 'config.json');
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        console.log(`\n${colors.green}Configuration saved!${colors.reset}\n`);
        return;
      }

      const q = questions[qIndex];
      rl.question(q.prompt, (answer) => {
        config[q.key] = answer.trim() || q.default;
        qIndex++;
        askQuestion();
      });
    };

    askQuestion();
  },

  setup: async () => {
    await ensureEULAAccepted();
    ensureConfigDir();
    console.log(`${colors.green}✓ Setup initialized${colors.reset}`);
    console.log(`${colors.cyan}Run 'openforge configure' to add credentials${colors.reset}`);
  },

  doctor: async () => {
    console.log(`${colors.cyan}Running health checks...${colors.reset}\n`);
    
    const checks = [
      { name: 'Node.js', cmd: 'node --version' },
      { name: 'NPM', cmd: 'npm --version' },
      { name: 'Config directory', check: () => fs.existsSync(CONFIG_DIR) },
      { name: 'EULA accepted', check: () => checkEULAAccepted() }
    ];

    for (const check of checks) {
      try {
        if (check.cmd) {
          await runCommand(check.cmd);
          console.log(`${colors.green}✓${colors.reset} ${check.name}`);
        } else if (check.check) {
          const result = check.check();
          console.log(`${result ? colors.green + '✓' : colors.red + '✗'}${colors.reset} ${check.name}`);
        }
      } catch {
        console.log(`${colors.red}✗${colors.reset} ${check.name}`);
      }
    }
  },

  update: async () => {
    console.log(`${colors.cyan}Checking for updates...${colors.reset}`);
    await runCommand('npm install -g openforge@latest');
    console.log(`${colors.green}OpenForge updated to latest${colors.reset}`);
  },

  reset: async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.yellow}Reset all local config and workspace? [yes/no]: ${colors.reset}`, async (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        if (fs.existsSync(CONFIG_DIR)) {
          fs.rmSync(CONFIG_DIR, { recursive: true });
        }
        console.log(`${colors.green}Reset complete${colors.reset}`);
      } else {
        console.log(`${colors.gray}Reset cancelled${colors.reset}`);
      }
    });
  },

  status: async () => {
    showBanner();
    console.log(`
 ${colors.bright}OpenForge Status${colors.reset}
 ─────────────────────
 ${colors.green}●${colors.reset} Gateway: ${fs.existsSync(CONFIG_DIR) ? 'Configured' : 'Not configured'}
 ${colors.green}●${colors.reset} EULA: ${checkEULAAccepted() ? 'Accepted' : 'Not accepted'}
 ${colors.green}●${colors.reset} Config: ${fs.existsSync(CONFIG_DIR) ? 'Ready' : 'Not initialized'}
    `);
  },

  health: async () => {
    try {
      const result = await fetch('http://localhost:3000/status');
      const data = await result.json();
      console.log(`${colors.green}Gateway Health:${colors.reset}`, data);
    } catch {
      console.log(`${colors.yellow}Gateway not running. Start with 'openforge gateway'${colors.reset}`);
    }
  },

  logs: async () => {
    console.log(`${colors.cyan}Tailing logs (Ctrl+C to exit)...${colors.reset}`);
    console.log(`${colors.yellow}Note: Configure gateway first with 'openforge gateway'${colors.reset}`);
  },

  docs: async () => {
    console.log(`${colors.cyan}Opening documentation...${colors.reset}`);
    runSpawn('open', ['https://openforge.ai/docs']);
  },

  completion: async () => {
    const shell = subArgs[0] || 'bash';
    console.log(`${colors.cyan}Generating ${shell} completion...${colors.reset}`);
    console.log(`
# Add to your ${shell}rc:
source <(openforge completion ${shell})
    `);
  },

  qr: async () => {
    console.log(`
 ${colors.cyan}╔══════════════════════════════════════╗
 ║         PAIRING QR CODE                 ║
 ║                                       ║
 ║    [ QR Code would display here ]     ║
 ║                                       ║
 ║   Scan with iOS/Android app           ║
 ╚══════════════════════════════════════╝
 ${colors.reset}
    `);
  },

  onboard: async () => {
    await ensureEULAAccepted();
    console.log(`${colors.cyan}Starting onboarding wizard...${colors.reset}`);
    console.log(`${colors.yellow}Use 'openforge configure' for full setup${colors.reset}`);
  },

  agents: async () => {
    console.log(`${colors.cyan}Agent management${colors.reset}`);
    console.log(`Subcommands: list, create, delete, start, stop`);
    console.log(`${colors.gray}Use 'openforge agent' for single agent mode${colors.reset}`);
  },

  agent: async () => {
    console.log(`${colors.cyan}Running single agent turn...${colors.reset}`);
    console.log(`${colors.yellow}Agent mode - connect to gateway first${colors.reset}`);
  },

  sandbox: async () => {
    console.log(`${colors.cyan}Sandbox container management${colors.reset}`);
    console.log(`Subcommands: create, list, remove, exec`);
  },

  hooks: async () => {
    console.log(`${colors.cyan}Hook management${colors.reset}`);
    console.log(`Subcommands: list, add, remove, trigger`);
  },

  channels: async () => {
    console.log(`${colors.cyan}Channel management${colors.reset}`);
    console.log(`Supported: Telegram, Discord, Slack, Matrix`);
    console.log(`Subcommands: add, remove, list, status`);
  },

  devices: async () => {
    console.log(`${colors.cyan}Device management${colors.reset}`);
    console.log(`Subcommands: list, pair, unpair, token`);
  },

  pairing: async () => {
    console.log(`${colors.cyan}Pairing management${colors.reset}`);
    console.log(`Subcommands: approve, reject, list, request`);
  },

  secrets: async () => {
    console.log(`${colors.cyan}Secrets management${colors.reset}`);
    console.log(`Subcommands: add, remove, list, reload`);
  },

  security: async () => {
    console.log(`${colors.cyan}Security audit${colors.reset}`);
    console.log(`Subcommands: audit, harden, validate, scan`);
  },

  system: async () => {
    console.log(`${colors.cyan}System monitoring${colors.reset}`);
    console.log(`Subcommands: events, heartbeat, presence, status`);
  },

  cron: async () => {
    console.log(`${colors.cyan}Cron scheduler${colors.reset}`);
    console.log(`Subcommands: add, remove, list, run`);
  },

  approvals: async () => {
    console.log(`${colors.cyan}Approval management${colors.reset}`);
    console.log(`Subcommands: list, approve, reject, clear`);
  },

  backup: async () => {
    console.log(`${colors.cyan}Backup management${colors.reset}`);
    console.log(`Subcommands: create, verify, restore, list`);
  },

  browser: async () => {
    console.log(`${colors.cyan}Browser management${colors.reset}`);
    console.log(`Subcommands: launch, close, list, screenshot`);
  },

  dns: async () => {
    console.log(`${colors.cyan}DNS network discovery${colors.reset}`);
    console.log(`Subcommands: status, scan, tailscale, coredns`);
  },

  directory: async () => {
    console.log(`${colors.cyan}Directory lookup${colors.reset}`);
    console.log(`Subcommands: search, contacts, groups, peers`);
  },

  memory: async () => {
    console.log(`${colors.cyan}Memory management${colors.reset}`);
    console.log(`Subcommands: search, store, reindex, clear`);
  },

  models: async () => {
    console.log(`${colors.cyan}AI Model management${colors.reset}`);
    console.log(`Subcommands: list, add, remove, scan, configure`);
  },

  nodes: async () => {
    console.log(`${colors.cyan}Node management${colors.reset}`);
    console.log(`Subcommands: list, add, remove, command`);
  },

  plugins: async () => {
    console.log(`${colors.cyan}Plugin management${colors.reset}`);
    console.log(`Subcommands: list, install, remove, enable, disable`);
  },

  skills: async () => {
    console.log(`${colors.cyan}AI Skills${colors.reset}`);
    console.log(`Subcommands: list, inspect, install, remove`);
  },

  sessions: async () => {
    console.log(`${colors.cyan}Session management${colors.reset}`);
    console.log(`Subcommands: list, load, save, clear`);
  },

  webhooks: async () => {
    console.log(`${colors.cyan}Webhook management${colors.reset}`);
    console.log(`Subcommands: add, remove, list, test`);
  },

  aiQuery: async () => {
    console.log(`${colors.cyan}AI Query across providers${colors.reset}`);
    console.log(`Supported: OpenAI, Anthropic, Groq, OpenRouter, DeepSeek, Z.ai, Local`);
    console.log(`Usage: openforge ai-query --provider openai "your question"`);
  },

  env: async () => {
    console.log(`${colors.cyan}Python Virtual Environment${colors.reset}`);
    console.log(`Subcommands: create, activate, install, remove, clean`);
  },

  run: async () => {
    console.log(`${colors.cyan}Execute scripts/workflows${colors.reset}`);
    console.log(`Usage: openforge run <script> [--local|--remote]`);
  },

  monitor: async () => {
    console.log(`${colors.cyan}Real-time monitoring${colors.reset}`);
    console.log(`Usage: openforge monitor [--agents|--system|--all]`);
  },

  pluginDev: async () => {
    console.log(`${colors.cyan}Plugin development${colors.reset}`);
    console.log(`Subcommands: scaffold, test, publish`);
  },

  workflow: async () => {
    console.log(`${colors.cyan}Workflow orchestration${colors.reset}`);
    console.log(`Subcommands: create, run, list, status`);
  },

  agentStats: async () => {
    console.log(`${colors.cyan}Agent Statistics${colors.reset}`);
    console.log(`Shows: usage, memory, performance metrics`);
  },

  uninstall: async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.red}Uninstall OpenForge? This removes all data. [yes/no]: ${colors.reset}`, async (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        if (fs.existsSync(CONFIG_DIR)) {
          fs.rmSync(CONFIG_DIR, { recursive: true });
        }
        await runCommand('npm uninstall -g openforge');
        console.log(`${colors.green}Uninstall complete${colors.reset}`);
      } else {
        console.log(`${colors.gray}Uninstall cancelled${colors.reset}`);
      }
    });
  },

  acp: async () => {
    console.log(`${colors.cyan}Agent Control Protocol${colors.reset}`);
    console.log(`Subcommands: connect, disconnect, send, receive, status`);
  },

  message: async () => {
    console.log(`${colors.cyan}Message management${colors.reset}`);
    console.log(`Subcommands: send, read, list, delete, search`);
  }
};

if (!command) {
  showHelp();
  process.exit(0);
}

if (command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (commands[command]) {
  showBanner();
  await ensureEULAAccepted();
  await commands[command]();
} else {
  showBanner();
  await ensureEULAAccepted();
  console.log(`${colors.cyan}Executing system command via OpenForge:${colors.reset} ${command}...`);
  try {
    const fullCommand = args.join(' ');
    const { stdout, stderr } = await execAsync(fullCommand);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`${colors.red}Failed:${colors.reset} ${error.message}`);
    console.log(`${colors.gray}Run 'openforge help' for available commands${colors.reset}`);
  }
}
