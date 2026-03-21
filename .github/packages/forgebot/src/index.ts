import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export interface ForgeBotConfig {
  provider: 'openai' | 'anthropic' | 'groq' | 'openrouter';
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ForgeBot extends EventEmitter {
  private config: ForgeBotConfig;
  private messages: Message[] = [];
  private systemPrompt = `You are ForgeBot, an AI assistant for OpenForge. You help users control their computer using natural language commands.`;

  constructor(config: ForgeBotConfig) {
    super();
    this.config = config;
    this.messages.push({ role: 'system', content: this.systemPrompt });
  }

  async chat(message: string): Promise<string> {
    this.messages.push({ role: 'user', content: message });
    
    const response = await this.callProvider(message);
    
    this.messages.push({ role: 'assistant', content: response });
    return response;
  }

  private async callProvider(message: string): Promise<string> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(message);
      case 'anthropic':
        return this.callAnthropic(message);
      case 'groq':
        return this.callGroq(message);
      case 'openrouter':
        return this.callOpenRouter(message);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  private async callOpenAI(message: string): Promise<string> {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: this.config.apiKey });
    
    const response = await client.chat.completions.create({
      model: this.config.model || 'gpt-4',
      messages: this.messages,
      max_tokens: this.config.maxTokens || 2000,
      temperature: this.config.temperature || 0.7,
    });
    
    return response.choices[0]?.message?.content || '';
  }

  private async callAnthropic(message: string): Promise<string> {
    return `[Anthropic] Would process: ${message}`;
  }

  private async callGroq(message: string): Promise<string> {
    return `[Groq] Would process: ${message}`;
  }

  private async callOpenRouter(message: string): Promise<string> {
    return `[OpenRouter] Would process: ${message}`;
  }

  async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [], { shell: true });
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => { stdout += data.toString(); });
      child.stderr?.on('data', (data) => { stderr += data.toString(); });
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  clearHistory(): void {
    this.messages = this.messages.filter(m => m.role === 'system');
  }

  getHistory(): Message[] {
    return [...this.messages];
  }
}

export default ForgeBot;
