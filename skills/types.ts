export interface SkillContext {
  agentId: string;
  sessionId: string;
  variables: Record<string, any>;
  history: Array<{ role: string; content: string }>;
}

export interface SkillResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface Skill {
  name: string;
  description: string;
  version: string;
  triggers?: string[];
  
  execute(context: SkillContext, args: any): Promise<SkillResult>;
  onLoad?(): Promise<void>;
  onUnload?(): Promise<void>;
}

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  triggers: string[];
}
