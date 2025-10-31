import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { AIProvider, ChatMessage } from './types';
import { SYSTEM_PROMPT, DEFAULT_MODELS } from './config';

export class CodeGenerator {
  private provider: AIProvider | null = null;
  private model: any = null;
  private modelName: string | null = null;
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
    this.modelName = customModel || DEFAULT_MODELS[provider];

    switch (provider) {
      case 'openai':
        if (!this.apiKeys.openai) {
          throw new Error('OpenAI API key not found. Set OPENAI_API_KEY or pass it to constructor.');
        }
        this.model = openai(this.modelName);
        break;
      case 'anthropic':
        if (!this.apiKeys.anthropic) {
          throw new Error('Anthropic API key not found. Set ANTHROPIC_API_KEY or pass it to constructor.');
        }
        this.model = anthropic(this.modelName);
        break;
      case 'google':
        if (!this.apiKeys.google) {
          throw new Error('Google API key not found. Set GOOGLE_API_KEY or pass it to constructor.');
        }
        this.model = google(this.modelName);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
  }

  async generatePlaywrightCode(instruction: string, aiSnapshotContext?: string, timeoutSec?: number): Promise<string> {
    if (!this.provider || !this.model) {
      throw new Error('Provider not set. Call setProvider() first.');
    }

    // Build user message with optional AI snapshot context and timeout info
    let userMessage = instruction;

    if (timeoutSec !== undefined) {
      userMessage = `${instruction}\n\n[Available execution time: ${timeoutSec} seconds]`;
    }

    if (aiSnapshotContext) {
      userMessage = `${userMessage}\n\n<current_page_ai_snapshot>\n${aiSnapshotContext}\n</current_page_ai_snapshot>`;
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // Check if model supports temperature parameter
      // o1 and GPT-5 models only support temperature=1 (default)
      const supportsCustomTemperature = !this.isReasoningModel();

      const generateConfig: any = {
        model: this.model,
        messages: this.conversationHistory,
        maxOutputTokens: 2000,
      };

      // Only add temperature if the model supports custom values
      if (supportsCustomTemperature) {
        generateConfig.temperature = 0.2;
      } else {
        generateConfig.temperature = 1;
      }

      const result = await generateText(generateConfig);

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

  private isReasoningModel(): boolean {
    if (!this.modelName) {
      return false;
    }

    const modelNameLower = this.modelName.toLowerCase();

    // OpenAI o1 and GPT-5 models don't support custom temperature
    return modelNameLower.includes('o1') ||
           modelNameLower.includes('gpt-5') ||
           modelNameLower.includes('gpt5');
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
