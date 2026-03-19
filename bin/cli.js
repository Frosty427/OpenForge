#!/usr/bin/env node
import { startGateway } from '../src/gateway/server.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
  OpenForge CLI - Advanced AI Assistant
  =====================================
  Usage: openforge <command>

  Commands:
  - gateway      : Start the AI control server (for remote agents)
  - start        : Launch the desktop GUI
  - config       : Configure AI providers (OpenAI, Anthropic, etc.)
  - help         : Show this help message
  `);
  process.exit(0);
}

if (command === 'gateway') {
    console.log('Starting OpenForge Gateway...');
    startGateway();
} else if (command === 'start') {
    console.log('Launching OpenForge Desktop UI...');
    // In production this would launch the built electron app
    exec('npm run dev', (err, stdout, stderr) => {
        if (err) console.error(err);
        console.log(stdout);
    });
} else {
    // Fallback simple exec for quick commands
    console.log(`Executing system command via OpenForge: ${command}...`);
    (async () => {
        try {
            const { stdout, stderr } = await execAsync(command);
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
        } catch (error) {
            console.error(`Failed: ${error.message}`);
        }
    })();
}
