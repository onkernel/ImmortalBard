export interface AISnapshotConfig {
  maxTokens?: number;
}

export interface AISnapshotContext {
  url: string;
  title: string;
  snapshot: string; // YAML-formatted ARIA snapshot
}

/**
 * Generates Playwright code that captures an AI-optimized snapshot of the current page
 * using Playwright's internal _snapshotForAI() method. This returns an ARIA/accessibility
 * tree in YAML format, which is more compact and AI-friendly than full DOM extraction.
 *
 * Note: _snapshotForAI() is an internal/experimental Playwright API.
 */
export function generateAISnapshotCode(): string {
  return `
// Capture AI-optimized snapshot using Playwright's internal _snapshotForAI() method
const snapshot = await page._snapshotForAI();

// Get page metadata
const url = page.url();
const title = await page.title();

return {
  url: url,
  title: title,
  snapshot: snapshot
};
`.trim();
}

/**
 * Formats AI snapshot context as a string for inclusion in AI prompts.
 * Handles token limiting by truncating the YAML snapshot if needed.
 */
export function formatAISnapshotContext(snapshotContext: AISnapshotContext, maxTokens?: number): string {
  let formatted = `URL: ${snapshotContext.url}\nTitle: ${snapshotContext.title}\n\nARIA Snapshot:\n${snapshotContext.snapshot}`;

  // Simple token estimation (roughly 4 chars per token)
  if (maxTokens) {
    const estimatedTokens = formatted.length / 4;
    if (estimatedTokens > maxTokens) {
      // Truncate to approximate token limit
      const maxChars = maxTokens * 4;
      formatted = formatted.substring(0, maxChars) + '\n... (truncated)';
    }
  }

  return formatted;
}
