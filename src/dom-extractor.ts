export interface DOMCaptureConfig {
  maxDepth?: number;
  maxTokens?: number;
}

export interface SimplifiedElement {
  tag: string;
  id?: string;
  classes?: string[];
  attributes?: {
    name?: string;
    type?: string;
    placeholder?: string;
    'aria-label'?: string;
    'data-testid'?: string;
    role?: string;
    href?: string;
    value?: string;
  };
  text?: string;
  children?: SimplifiedElement[];
}

export interface DOMContext {
  url: string;
  title: string;
  body: SimplifiedElement;
}

/**
 * Generates Playwright code that extracts a simplified DOM structure
 * from the current page. This code will be executed via Kernel SDK.
 */
export function generateDOMExtractionCode(config: DOMCaptureConfig = {}): string {
  const maxDepth = config.maxDepth || 5;

  return `
// Extract simplified DOM structure for AI context
return await page.evaluate((maxDepth) => {
  function simplifyElement(el, depth = 0) {
    // Stop recursion at max depth
    if (depth > maxDepth || !el) {
      return null;
    }

    // Skip script, style, and meta tags
    const skipTags = ['script', 'style', 'meta', 'link', 'noscript'];
    if (skipTags.includes(el.tagName.toLowerCase())) {
      return null;
    }

    // Get text content (first 100 chars, trimmed)
    let text = '';
    if (el.childNodes.length > 0) {
      const textNodes = Array.from(el.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent?.trim())
        .filter(Boolean);
      if (textNodes.length > 0) {
        text = textNodes.join(' ').substring(0, 100);
      }
    }

    // Build simplified element
    const simplified = {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: el.className && typeof el.className === 'string'
        ? el.className.split(/\\s+/).filter(Boolean)
        : undefined,
      attributes: {
        name: el.getAttribute('name') || undefined,
        type: el.getAttribute('type') || undefined,
        placeholder: el.getAttribute('placeholder') || undefined,
        'aria-label': el.getAttribute('aria-label') || undefined,
        'data-testid': el.getAttribute('data-testid') || undefined,
        role: el.getAttribute('role') || undefined,
        href: el.getAttribute('href') || undefined,
        value: el.getAttribute('value') || undefined,
      },
      text: text || undefined,
      children: undefined
    };

    // Remove empty attributes object if no attributes exist
    if (Object.values(simplified.attributes).every(v => v === undefined)) {
      simplified.attributes = undefined;
    }

    // Recursively process children
    const children = Array.from(el.children)
      .map(child => simplifyElement(child, depth + 1))
      .filter(Boolean);

    if (children.length > 0) {
      simplified.children = children;
    }

    return simplified;
  }

  return {
    url: window.location.href,
    title: document.title,
    body: simplifyElement(document.body, 0)
  };
}, ${maxDepth});
`.trim();
}

/**
 * Formats DOM context as a string for inclusion in AI prompts
 */
export function formatDOMContext(domContext: DOMContext, maxTokens?: number): string {
  let formatted = JSON.stringify(domContext, null, 2);

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
