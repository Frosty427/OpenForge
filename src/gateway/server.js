import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

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
