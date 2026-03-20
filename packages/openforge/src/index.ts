import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface OpenForgeConfig {
  port: number;
  wsPort: number;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    groq?: string;
    openrouter?: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  ws: WebSocket;
  context: Record<string, any>;
}

export class OpenForge {
  private app: express.Application;
  private wss: WebSocketServer | null = null;
  private config: OpenForgeConfig;
  private agents: Map<string, Agent> = new Map();

  constructor(config: OpenForgeConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  private setupRoutes() {
    this.app.post('/execute', async (req, res) => {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      console.log(`[OpenForge] Executing: ${command}`);
      try {
        const { stdout, stderr } = await execAsync(command);
        res.json({ success: true, stdout, stderr });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/status', (req, res) => {
      res.json({
        status: 'online',
        mode: 'openforge',
        agents: this.agents.size,
        version: '1.0.0'
      });
    });

    this.app.get('/agents', (req, res) => {
      const agents = Array.from(this.agents.values()).map(a => ({
        id: a.id,
        name: a.name,
        context: a.context
      }));
      res.json({ agents });
    });
  }

  start(): void {
    this.app.listen(this.config.port, () => {
      console.log(`
      ============================================
      🚀 OpenForge Core running on port ${this.config.port}
      ============================================

      HTTP Endpoints:
      - POST /execute { "command": "..." }
      - GET /status
      - GET /agents

      WebSocket: ws://localhost:${this.config.wsPort}
      `);
    });

    this.wss = new WebSocketServer({ port: this.config.wsPort });
    
    this.wss.on('connection', (ws, req) => {
      const agentId = `agent-${Date.now()}`;
      const agent: Agent = {
        id: agentId,
        name: `Agent ${agentId}`,
        ws,
        context: {}
      };
      
      this.agents.set(agentId, agent);
      console.log(`[OpenForge] Agent connected: ${agentId}`);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleAgentMessage(agent, message);
        } catch (error) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.agents.delete(agentId);
        console.log(`[OpenForge] Agent disconnected: ${agentId}`);
      });
    });
  }

  private async handleAgentMessage(agent: Agent, message: any): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case 'ping':
        agent.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
        
      case 'execute':
        try {
          const { stdout, stderr } = await execAsync(payload.command);
          agent.ws.send(JSON.stringify({ 
            type: 'result', 
            success: true, 
            stdout, 
            stderr 
          }));
        } catch (error: any) {
          agent.ws.send(JSON.stringify({ 
            type: 'result', 
            success: false, 
            error: error.message 
          }));
        }
        break;
        
      case 'context_update':
        agent.context = { ...agent.context, ...payload };
        agent.ws.send(JSON.stringify({ type: 'context_updated' }));
        break;

      default:
        agent.ws.send(JSON.stringify({ error: `Unknown message type: ${type}` }));
    }
  }

  broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.agents.forEach(agent => {
      if (agent.ws.readyState === WebSocket.OPEN) {
        agent.ws.send(data);
      }
    });
  }
}

export default OpenForge;
