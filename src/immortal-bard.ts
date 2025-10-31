import { KernelClient } from './kernel-client';
import { CodeGenerator } from './code-generator';
import { ImmortalBardConfig, BeseechResult, BeseechOptions, AISnapshotOptions } from './types';
import { generateAISnapshotCode, formatAISnapshotContext, AISnapshotContext } from './ai-snapshot';
import { validateTimeout } from './config';

export class ImmortalBard {
  private kernelClient: KernelClient;
  private codeGenerator: CodeGenerator;
  private currentSessionId: string | null = null;
  private isSceneSet: boolean = false;
  private aiSnapshotConfig: AISnapshotOptions;

  constructor(openaiApiKey?: string, anthropicApiKey?: string, googleApiKey?: string) {
    this.kernelClient = new KernelClient();
    this.codeGenerator = new CodeGenerator(openaiApiKey, anthropicApiKey, googleApiKey);
    this.aiSnapshotConfig = {
      enabled: true,
      maxTokens: 4000,
    };
  }

  async scene(config: ImmortalBardConfig): Promise<void> {
    try {
      this.codeGenerator.setProvider(config.provider, config.model);

      // Configure AI snapshot options
      if (config.aiSnapshot) {
        this.aiSnapshotConfig = {
          ...this.aiSnapshotConfig,
          ...config.aiSnapshot,
        };
      }

      this.isSceneSet = true;
    } catch (error) {
      throw new Error(`Failed to set the scene: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async toBe(): Promise<void> {
    if (!this.isSceneSet) {
      throw new Error('Scene not set. Call scene() before toBe().');
    }

    if (this.currentSessionId) {
      throw new Error('Session already active. Call notToBe() first.');
    }

    try {
      const session = await this.kernelClient.launchSession();
      this.currentSessionId = session.session_id;

      process.on('beforeExit', () => {
        if (this.currentSessionId) {
          this.notToBe().catch(console.error);
        }
      });
    } catch (error) {
      throw new Error(`Failed to enter the stage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async beseech(instruction: string, options?: BeseechOptions): Promise<BeseechResult> {
    if (!this.currentSessionId) {
      return {
        code: '',
        result: null,
        error: 'No active session. Call toBe() first.',
      };
    }

    // Validate and clamp timeout value
    const validatedTimeout = validateTimeout(options?.timeout);

    try {
      // Capture AI snapshot if enabled
      let aiSnapshotContext: string | undefined;
      if (this.aiSnapshotConfig.enabled) {
        try {
          aiSnapshotContext = await this.captureAISnapshot();
        } catch (snapshotError) {
          // Don't fail the entire beseech if AI snapshot capture fails
          console.warn('AI snapshot capture failed:', snapshotError);
        }
      }

      // Generate code with optional AI snapshot context and timeout
      const generatedCode = await this.codeGenerator.generatePlaywrightCode(
        instruction,
        aiSnapshotContext,
        validatedTimeout
      );

      try {
        const executionResult = await this.kernelClient.execute(
          this.currentSessionId,
          generatedCode,
          validatedTimeout
        );

        return {
          code: generatedCode,
          result: executionResult.result,
          error: executionResult.success ? null : (executionResult.error || 'Execution failed'),
        };
      } catch (execError) {
        return {
          code: generatedCode,
          result: null,
          error: `Execution error: ${execError instanceof Error ? execError.message : String(execError)}`,
        };
      }
    } catch (genError) {
      return {
        code: '',
        result: null,
        error: `Code generation error: ${genError instanceof Error ? genError.message : String(genError)}`,
      };
    }
  }

  private async captureAISnapshot(): Promise<string> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    // Generate Playwright code to capture AI snapshot
    const aiSnapshotCode = generateAISnapshotCode();

    // Execute the AI snapshot code via Kernel SDK
    const result = await this.kernelClient.execute(this.currentSessionId, aiSnapshotCode);

    if (!result.success || !result.result) {
      throw new Error(`AI snapshot capture failed: ${result.error || 'Unknown error'}`);
    }

    // Format AI snapshot context for AI consumption
    const snapshotContext = result.result as AISnapshotContext;
    return formatAISnapshotContext(snapshotContext, this.aiSnapshotConfig.maxTokens);
  }

  async notToBe(): Promise<void> {
    if (!this.currentSessionId) {
      return;
    }

    try {
      await this.kernelClient.closeSession(this.currentSessionId);
      this.currentSessionId = null;
    } catch (error) {
      throw new Error(`Failed to exit the stage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  isPerforming(): boolean {
    return this.currentSessionId !== null;
  }
}
