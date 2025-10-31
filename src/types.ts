export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AISnapshotOptions {
  enabled?: boolean;
  maxTokens?: number;
}

export interface ImmortalBardConfig {
  provider: AIProvider;
  model?: string;
  aiSnapshot?: AISnapshotOptions;
}

export interface KernelSession {
  session_id: string;
  wsEndpoint?: string;
  status?: string;
  browser_live_view_url?: string;
}

export interface KernelExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  stdout?: string;
  stderr?: string;
}

export interface BeseechResult {
  code: string;
  result: any;
  error: string | null;
}

export interface BeseechOptions {
  timeout?: number; // Timeout in seconds (min: 1, max: 300, default: 60)
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
