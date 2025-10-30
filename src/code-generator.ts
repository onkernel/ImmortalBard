import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { AIProvider, ChatMessage } from './types';
import { SYSTEM_PROMPT, DEFAULT_MODELS } from './config';

export class CodeGenerator {
  private provider: AIProvider | null = null;
  private model: any = null;
  private conversationHistory: ChatMessage[] = [];
  private apiKeys: Record<string, string | undefined>;

  constructor(
    openaiKey?: string,
    anthropicKey?: string,
    googleKey?: string
  ) {
    this.apiKeys = {
      openai: openaiKey || process.env.OPENAI_API_KEY,
      anthropic: anthropicKey || process.env.ANTHROPIC_API_KEY,
      google: googleKey || process.env.GOOGLE_API_KEY,
    };
  }

  setProvider(provider: AIProvider, customModel?: string): void {
    this.provider = provider;
    const modelName = customModel || DEFAULT_MODELS[provider];

    switch (provider) {
      case 'openai':
        if (!this.apiKeys.openai) {
          throw new Error('OpenAI API key not found. Set OPENAI_API_KEY or pass it to constructor.');
        }
        this.model = openai(modelName);
        break;
      case 'anthropic':
        if (!this.apiKeys.anthropic) {
          throw new Error('Anthropic API key not found. Set ANTHROPIC_API_KEY or pass it to constructor.');
        }
        this.model = anthropic(modelName);
        break;
      case 'google':
        if (!this.apiKeys.google) {
          throw new Error('Google API key not found. Set GOOGLE_API_KEY or pass it to constructor.');
        }
        this.model = google(modelName);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
  }

  async generatePlaywrightCode(instruction: string, aiSnapshotContext?: string): Promise<string> {
    if (!this.provider || !this.model) {
      throw new Error('Provider not set. Call setProvider() first.');
    }

    // Build user message with optional AI snapshot context
    let userMessage = instruction;
    if (aiSnapshotContext) {
      userMessage = `${instruction}\n\n<current_page_ai_snapshot>\n${aiSnapshotContext}\n</current_page_ai_snapshot>`;
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      const result = await generateText({
        model: this.model,
        messages: this.conversationHistory,
        temperature: 0.2,
        maxTokens: 2000,
      });

      const cleanedCode = this.cleanCode(result.text);

      this.conversationHistory.push({
        role: 'assistant',
        content: cleanedCode,
      });

      return cleanedCode;
    } catch (error) {
      throw new Error(`Code generation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private cleanCode(text: string): string {
    let code = text.trim();
    code = code.replace(/```(?:typescript|javascript|ts|js)?\n?/g, '');
    code = code.replace(/```/g, '');
    return code.trim();
  }

  resetContext(): void {
    if (this.provider) {
      this.conversationHistory = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];
    }
  }
}
