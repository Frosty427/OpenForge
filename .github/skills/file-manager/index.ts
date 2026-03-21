import { Skill, SkillContext, SkillResult } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export const fileManagerSkill: Skill = {
  name: 'file-manager',
  description: 'File and directory operations - read, write, list, delete files',
  version: '1.0.0',
  triggers: ['read file', 'write file', 'list files', 'delete file', 'create directory'],

  async execute(context: SkillContext, args: { action: string; path?: string; content?: string }): Promise<SkillResult> {
    try {
      switch (args.action) {
        case 'read':
          const content = await fs.readFile(args.path!, 'utf-8');
          return { success: true, data: content };

        case 'write':
          await fs.writeFile(args.path!, args.content || '');
          return { success: true, data: { message: 'File written successfully' } };

        case 'list':
          const files = await fs.readdir(args.path || '.');
          return { success: true, data: files };

        case 'delete':
          await fs.unlink(args.path!);
          return { success: true, data: { message: 'File deleted' } };

        case 'mkdir':
          await fs.mkdir(args.path!, { recursive: true });
          return { success: true, data: { message: 'Directory created' } };

        case 'stat':
          const stats = await fs.stat(args.path!);
          return { success: true, data: stats };

        default:
          return { success: false, error: `Unknown action: ${args.action}` };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

export default fileManagerSkill;
