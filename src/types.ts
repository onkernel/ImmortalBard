export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface DOMCaptureOptions {
  enabled?: boolean;
  maxDepth?: number;
  maxTokens?: number;
}

export interface ImmortalBardConfig {
  provider: AIProvider;
  model?: string;
  domCapture?: DOMCaptureOptions;
}

export interface KernelSession {
  session_id: string;
  wsEndpoint?: string;
  status?: string;
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

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
