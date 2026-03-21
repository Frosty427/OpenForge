<<<<<<< HEAD
import OpenAI from 'openai';

export type AIProvider = 'openai' | 'anthropic' | 'openrouter' | 'local' | 'groq' | 'gemini' | 'poe';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

// System Skills / Tools
const systemTools: any[] = [
  {
    type: "function",
    function: {
      name: "run_command",
      description: "Execute a shell command on the computer.",
      parameters: {
        type: "object",
        properties: { command: { type: "string" } },
        required: ["command"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "open_app",
      description: "Open a specific application.",
      parameters: {
        type: "object",
        properties: { app_name: { type: "string" } },
        required: ["app_name"]
      }
    }
  },
  // New Skills
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Write content to a file. WARNING: Overwrites existing files.",
      parameters: {
        type: "object",
        properties: { 
            path: { type: "string" },
            content: { type: "string" }
        },
        required: ["path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read content from a file.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      }
    }
  }
];

export class AIManager {
  private client: OpenAI | null = null;
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
    this.initializeClient();
  }

  private initializeClient() {
    let config: any = {
      apiKey: this.settings.apiKey,
      dangerouslyAllowBrowser: true 
    };

    // Configuration for different providers using OpenAI-compatible SDK
    switch (this.settings.provider) {
        case 'openrouter':
            config.baseURL = 'https://openrouter.ai/api/v1';
            break;
        case 'local':
            config.baseURL = this.settings.baseUrl || 'http://localhost:11434/v1';
            break;
        case 'groq':
            config.baseURL = 'https://api.groq.com/openai/v1';
            break;
        case 'gemini':
            // Google Gemini uses a different SDK usually, but can be accessed via OpenRouter or proxies.
            // For this demo, we assume the user might use a proxy or OpenRouter for Gemini.
            // If direct, we would need the @google/generative-ai package.
            // We'll default to OpenRouter endpoint for simplicity if 'gemini' is selected without custom URL.
            if (!this.settings.baseUrl) config.baseURL = 'https://openrouter.ai/api/v1'; 
            break;
        case 'anthropic':
            // Similarly, Anthropic is best used via OpenRouter in this architecture 
            // to avoid installing multiple heavy SDKs in the client.
            if (!this.settings.baseUrl) config.baseURL = 'https://openrouter.ai/api/v1';
            break;
        default:
            // OpenAI default
            break;
    }

    if (this.settings.baseUrl) {
        config.baseURL = this.settings.baseUrl;
    }

    this.client = new OpenAI(config);
  }

  async generateResponse(messages: any[]) {
    if (!this.client) throw new Error('AI Client not initialized');

    try {
      const response = await this.client.chat.completions.create({
        messages: [
            { 
                role: "system", 
                content: "You are OpenForge, an advanced AI system capable of controlling the computer. You have access to file systems, command lines, and applications. Always warn the user before destructive actions. If the user asks for code, provide it. If they ask for action, perform it." 
            },
            ...messages
        ],
        model: this.settings.model,
        tools: systemTools,
        tool_choice: "auto",
      });

      const message = response.choices[0].message;
      if (message.tool_calls) {
        return { tool_calls: message.tool_calls };
      }
      return { content: message.content || "I'm silent." };
    } catch (error: any) {
      console.error('AI Error:', error);
      return { content: `AI Error: ${error.message}. Please checks your API Key and Provider settings.` };
    }
  }

  updateSettings(newSettings: AISettings) {
    this.settings = newSettings;
    this.initializeClient();
  }
}
=======
import OpenAI from 'openai';

export type AIProvider = 'openai' | 'anthropic' | 'openrouter' | 'local' | 'groq' | 'gemini' | 'poe';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

// System Skills / Tools
const systemTools: any[] = [
  {
    type: "function",
    function: {
      name: "run_command",
      description: "Execute a shell command on the computer.",
      parameters: {
        type: "object",
        properties: { command: { type: "string" } },
        required: ["command"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "open_app",
      description: "Open a specific application.",
      parameters: {
        type: "object",
        properties: { app_name: { type: "string" } },
        required: ["app_name"]
      }
    }
  },
  // New Skills
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Write content to a file. WARNING: Overwrites existing files.",
      parameters: {
        type: "object",
        properties: { 
            path: { type: "string" },
            content: { type: "string" }
        },
        required: ["path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read content from a file.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      }
    }
  }
];

export class AIManager {
  private client: OpenAI | null = null;
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
    this.initializeClient();
  }

  private initializeClient() {
    let config: any = {
      apiKey: this.settings.apiKey,
      dangerouslyAllowBrowser: true 
    };

    // Configuration for different providers using OpenAI-compatible SDK
    switch (this.settings.provider) {
        case 'openrouter':
            config.baseURL = 'https://openrouter.ai/api/v1';
            break;
        case 'local':
            config.baseURL = this.settings.baseUrl || 'http://localhost:11434/v1';
            break;
        case 'groq':
            config.baseURL = 'https://api.groq.com/openai/v1';
            break;
        case 'gemini':
            // Google Gemini uses a different SDK usually, but can be accessed via OpenRouter or proxies.
            // For this demo, we assume the user might use a proxy or OpenRouter for Gemini.
            // If direct, we would need the @google/generative-ai package.
            // We'll default to OpenRouter endpoint for simplicity if 'gemini' is selected without custom URL.
            if (!this.settings.baseUrl) config.baseURL = 'https://openrouter.ai/api/v1'; 
            break;
        case 'anthropic':
            // Similarly, Anthropic is best used via OpenRouter in this architecture 
            // to avoid installing multiple heavy SDKs in the client.
            if (!this.settings.baseUrl) config.baseURL = 'https://openrouter.ai/api/v1';
            break;
        default:
            // OpenAI default
            break;
    }

    if (this.settings.baseUrl) {
        config.baseURL = this.settings.baseUrl;
    }

    this.client = new OpenAI(config);
  }

  async generateResponse(messages: any[]) {
    if (!this.client) throw new Error('AI Client not initialized');

    try {
      const response = await this.client.chat.completions.create({
        messages: [
            { 
                role: "system", 
                content: "You are OpenForge, an advanced AI system capable of controlling the computer. You have access to file systems, command lines, and applications. Always warn the user before destructive actions. If the user asks for code, provide it. If they ask for action, perform it." 
            },
            ...messages
        ],
        model: this.settings.model,
        tools: systemTools,
        tool_choice: "auto",
      });

      const message = response.choices[0].message;
      if (message.tool_calls) {
        return { tool_calls: message.tool_calls };
      }
      return { content: message.content || "I'm silent." };
    } catch (error: any) {
      console.error('AI Error:', error);
      return { content: `AI Error: ${error.message}. Please checks your API Key and Provider settings.` };
    }
  }

  updateSettings(newSettings: AISettings) {
    this.settings = newSettings;
    this.initializeClient();
  }
}
>>>>>>> 6a986b7 (new version)
