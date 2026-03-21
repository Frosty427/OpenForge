# OpenForge Skills

This folder contains AI skills and plugins for OpenForge.

## Structure

Each skill is a separate module with:
- `index.ts` - Main skill implementation
- `skill.json` - Skill metadata
- `README.md` - Skill documentation

## Available Skills

- `file-manager` - File and directory operations
- `web-search` - Web search and scraping
- `code-runner` - Execute code in various languages
- `system-control` - System commands and controls

## Creating a New Skill

```typescript
import { Skill, SkillContext } from '../types';

export const mySkill: Skill = {
  name: 'my-skill',
  description: 'My custom skill',
  version: '1.0.0',
  
  async execute(context: SkillContext, args: any) {
    // Skill logic here
    return { result: 'success' };
  }
};
```

## Installing Skills

Place skill folders in this directory and they will be auto-loaded by OpenForge.
