import { KernelClient } from './kernel-client';
import { CodeGenerator } from './code-generator';
import { ImmortalBardConfig, BeseechResult, DOMCaptureOptions } from './types';
import { generateDOMExtractionCode, formatDOMContext, DOMContext } from './dom-extractor';

export class ImmortalBard {
  private kernelClient: KernelClient;
  private codeGenerator: CodeGenerator;
  private currentSessionId: string | null = null;
  private isSceneSet: boolean = false;
  private domCaptureConfig: DOMCaptureOptions;

  constructor(openaiApiKey?: string, anthropicApiKey?: string, googleApiKey?: string) {
    this.kernelClient = new KernelClient();
    this.codeGenerator = new CodeGenerator(openaiApiKey, anthropicApiKey, googleApiKey);
    this.domCaptureConfig = {
      enabled: true,
      maxDepth: 5,
      maxTokens: 4000,
    };
  }

  async scene(config: ImmortalBardConfig): Promise<void> {
    try {
      this.codeGenerator.setProvider(config.provider, config.model);

      // Configure DOM capture options
      if (config.domCapture) {
        this.domCaptureConfig = {
          ...this.domCaptureConfig,
          ...config.domCapture,
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

  async beseech(instruction: string): Promise<BeseechResult> {
    if (!this.currentSessionId) {
      return {
        code: '',
        result: null,
        error: 'No active session. Call toBe() first.',
      };
    }

    try {
      // Capture DOM structure if enabled
      let domContext: string | undefined;
      if (this.domCaptureConfig.enabled) {
        try {
          domContext = await this.captureDOMStructure();
        } catch (domError) {
          // Don't fail the entire beseech if DOM capture fails
          console.warn('DOM capture failed:', domError);
        }
      }

      // Generate code with optional DOM context
      const generatedCode = await this.codeGenerator.generatePlaywrightCode(instruction, domContext);

      try {
        const executionResult = await this.kernelClient.execute(this.currentSessionId, generatedCode);

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

  private async captureDOMStructure(): Promise<string> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    // Generate Playwright code to extract DOM
    const domExtractionCode = generateDOMExtractionCode({
      maxDepth: this.domCaptureConfig.maxDepth,
      maxTokens: this.domCaptureConfig.maxTokens,
    });

    // Execute the DOM extraction code via Kernel SDK
    const result = await this.kernelClient.execute(this.currentSessionId, domExtractionCode);

    if (!result.success || !result.result) {
      throw new Error(`DOM extraction failed: ${result.error || 'Unknown error'}`);
    }

    // Format DOM context for AI consumption
    const domContext = result.result as DOMContext;
    return formatDOMContext(domContext, this.domCaptureConfig.maxTokens);
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
