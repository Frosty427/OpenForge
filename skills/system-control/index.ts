import { Skill, SkillContext, SkillResult } from '../types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const systemControlSkill: Skill = {
  name: 'system-control',
  description: 'System control - run commands, manage processes, system info',
  version: '1.0.0',
  triggers: ['run command', 'system info', 'processes', 'kill process', 'open app'],

  async execute(context: SkillContext, args: { action: string; command?: string; target?: string }): Promise<SkillResult> {
    try {
      switch (args.action) {
        case 'run':
          const { stdout, stderr } = await execAsync(args.command!);
          return { success: true, data: { stdout, stderr } };

        case 'info':
          return { 
            success: true, 
            data: { 
              platform: process.platform,
              arch: process.arch,
              nodeVersion: process.version,
              uptime: process.uptime()
            } 
          };

        case 'open':
          const openCmd = process.platform === 'win32' 
            ? `start "" "${args.target}"` 
            : `open "${args.target}"`;
          await execAsync(openCmd);
          return { success: true, data: { message: `Opened: ${args.target}` } };

        case 'kill':
          await execAsync(`taskkill /F /PID ${args.target}`);
          return { success: true, data: { message: `Killed process: ${args.target}` } };

        default:
          return { success: false, error: `Unknown action: ${args.action}` };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

export default systemControlSkill;
