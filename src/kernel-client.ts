import Kernel from '@onkernel/sdk';
import { KernelSession, KernelExecutionResult } from './types';

export class KernelClient {
  private kernel: Kernel;

  constructor() {
    this.kernel = new Kernel();
  }

  async launchSession(): Promise<KernelSession> {
    try {
      const session = await this.kernel.browsers.create();
      return session as KernelSession;
    } catch (error) {
      throw new Error(`Kernel SDK error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async execute(sessionId: string, code: string): Promise<KernelExecutionResult> {
    try {
      const response = await this.kernel.browsers.playwright.execute(sessionId, { code });
      return response;
    } catch (error) {
      throw new Error(`Kernel SDK error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    try {
      await this.kernel.browsers.deleteByID(sessionId);
    } catch (error) {
      throw new Error(`Kernel SDK error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
