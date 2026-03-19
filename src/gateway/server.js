import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

// Security Warning
console.warn("\x1b[31m%s\x1b[0m", "⚠️  WARNING: OpenForge Gateway gives remote access to your system. Only use on trusted networks.");

app.use(cors());
app.use(bodyParser.json());

// Disclaimer Check Middleware
let disclaimerAccepted = false;

app.post('/accept-disclaimer', (req, res) => {
    disclaimerAccepted = true;
    res.json({ status: 'accepted', message: 'Liability disclaimer accepted. Gateway is now active.' });
});

app.use((req, res, next) => {
    if (!disclaimerAccepted && req.path !== '/status') {
        return res.status(403).json({ 
            error: 'Liability disclaimer not accepted.', 
            action_required: 'POST /accept-disclaimer to agree that you are responsible for AI actions.' 
        });
    }
    next();
});

// Execute raw shell commands
app.post('/execute', async (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'Command is required' });

    console.log(`[GATEWAY] Executing: ${command}`);
    try {
        const { stdout, stderr } = await execAsync(command);
        res.json({ success: true, stdout, stderr });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Status check
app.get('/status', (req, res) => {
    res.json({ status: 'online', mode: 'gateway', ai_engine: 'ready' });
});

export function startGateway() {
    app.listen(PORT, () => {
        console.log(`
        =============================================
        🚀 OpenForge Gateway is running on port ${PORT}
        =============================================
        
        This mode allows external AI agents to control your PC via HTTP.
        
        Endpoints:
        - POST /execute { "command": "calc" } -> Run a command
        - GET /status -> Check system status
        
        Use responsibly.
        `);
    });
}
