export interface ConfigInfo {
  provider: string;
  model: string;
  baseURL: string;
}

export interface ParsedContent {
  thinking: string[];
  toolCalls: Array<{ name: string; args: string }>;
  regular: string;
  hasIncompleteTags: boolean;
}

export interface ToolInvocation {
  toolName: string;
  state: string;
  args?: any;
  result?: any;
}
