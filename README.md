# 🎭 IMMORTAL BARD

**Natural language browser automation worthy of the Globe Theatre.**

> *"All the world's a stage, and all the browsers merely players."*

Command browsers as the Bard commanded language itself. No more wrestling with selectors or debugging brittle scripts. Set the scene, beseech your intent, and let The Immortal Bard transform your natural language into eloquent Playwright code for execution.

Powered by [AI SDK](https://ai-sdk.dev/), [Kernel's](https://www.onkernel.com/docs/introduction) cloud browser infra with [Playwright Execution API](https://www.onkernel.com/docs/browsers/playwright-execution), and the timeless spirit of Shakespeare.

## What Is This?

ImmortalBard vanquishes browser automation complexity. Speak your desires in plain English, and ImmortalBard crafts and performs masterful Playwright code in real browsers running in Kernel's cloud infrastructure.

## Features Most Excellent

- **🎭 Natural Language Commands**: No code theatrics. Speak thy intent, the Bard performs.
- **📜 Multi-Provider AI**: Choose your muse—OpenAI, Anthropic, or Google AI models
- **⚡ Zero-Latency Execution**: Code runs directly in browser VMs via Kernel's Playwright API
- **🎯 DOM-Aware Generation**: Captures live page structure before every command—no more guessing selectors
- **🧠 Contextual Intelligence**: Maintains conversation history across commands for smarter automation
- **🔒 TypeScript Native**: Full type safety, because drama belongs on the stage, not in your codebase

## Local Development Setup

This SDK is currently in development and not yet published to npm. To use it locally:

### 1. Clone and Build

```bash
# Clone the repository
git clone <repository-url>
cd ImmortalBard

# Install dependencies
npm install

# Build the TypeScript source
npm run build
```

### 2. Link Locally (Optional)

To use ImmortalBard in another local project:

```bash
# In the ImmortalBard directory
npm link

# In your project directory
npm link immortal-bard
```

Or simply import directly from the built files:

```typescript
// In your project (assuming ImmortalBard is in a sibling directory)
import { ImmortalBard } from '../ImmortalBard/dist/index.js';
```

### 3. Run the Example

```bash
# Create a .env file with your API keys (see below)
# Then run the included example
npm start
```

## Setup: Prepare the Stage

### API Keys (Your Player's Entrance)

You'll need:

1. **Kernel API Key** - Your entrance to the cloud theatre → [kernel.com](https://kernel.com)
2. **AI Provider Key** - Choose your dramatic voice:
   - [OpenAI](https://platform.openai.com/)
   - [Anthropic](https://console.anthropic.com/)
   - [Google AI](https://makersuite.google.com/)

### Environment Variables (The Prologue)

Drop these in a `.env` file:

```bash
KERNEL_API_KEY=your_kernel_api_key
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key
# OR
GOOGLE_API_KEY=your_google_key
```

Or inject them directly into the constructor (no `.env` required):

```typescript
const bard = new ImmortalBard(openaiApiKey, anthropicApiKey, googleApiKey);
```

## Usage: The Performance Begins

### The 4-Act Play

```typescript
import { ImmortalBard } from 'immortal-bard';

const bard = new ImmortalBard();

// 1. SET THE SCENE - Choose your AI muse
await bard.scene({ provider: 'openai' });

// 2. TO BE - Launch a cloud browser (or not to be?)
await bard.toBe();

// 3. BESEECH - Command in natural language
const result = await bard.beseech('Navigate to https://example.com');
console.log('Generated code:', result.code);
console.log('Returned data:', result.result);

// 4. NOT TO BE - Close the session
await bard.notToBe();
```

### A Five-Act Performance (Multi-Step Automation)

```typescript
import { ImmortalBard } from 'immortal-bard';

const bard = new ImmortalBard();

await bard.scene({ provider: 'anthropic' });
await bard.toBe();

// Each beseech() remembers the previous context
await bard.beseech('Go to github.com');
await bard.beseech('Search for "vercel ai sdk"');
await bard.beseech('Click the first repository result');
await bard.beseech('Extract all the links from the README');

await bard.notToBe();
```

## API Reference: Dramatis Personae

### `new ImmortalBard(openaiApiKey?, anthropicApiKey?, googleApiKey?)`

Initialize the Immortal Bard. Pass API keys directly or rely on environment variables.

### `await bard.scene(config: ImmortalBardConfig)`

**Set the scene** - Configure which AI muse powers your browser automation.

```typescript
interface ImmortalBardConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model?: string; // Optional: custom model name
}
```

**Default models** (you can override with `model: 'your-custom-model'`):
- OpenAI: `gpt-4.1`
- Anthropic: `claude-sonnet-4-5`
- Google: `gemini-2.5-pro`

### `await bard.toBe()`

**To be** - Launch a remote browser session in Kernel's cloud infrastructure. Enter the stage.

### `await bard.beseech(instruction: string): Promise<BeseechResult>`

**Beseech the Bard** - Speak thy intent in natural language. The Bard transforms it into Playwright code, captures the current page DOM for context, executes in the remote browser, and returns all.

**Returns:**
```typescript
interface BeseechResult {
  code: string;         // The Playwright code generated
  result: any;          // Data returned from execution (via return statements)
  error: string | null; // Error details if something failed
}
```

### `await bard.notToBe()`

**Not to be** - Close the browser session and clean up resources. Exit the stage.

### `bard.isPerforming(): boolean`

**Check if performing** - Returns `true` if a browser session is currently active.

## Examples: Notable Soliloquies

### Choose Your Muse

```typescript
// OpenAI (gpt-4.1)
await bard.scene({ provider: 'openai' });

// Anthropic (claude-sonnet-4-5)
await bard.scene({ provider: 'anthropic' });

// Google (gemini-2.5-pro)
await bard.scene({ provider: 'google' });

// Bring your own muse
await bard.scene({ provider: 'openai', model: 'gpt-4-turbo' });
```

### Handle Stage Directions

```typescript
const result = await bard.beseech('Click the submit button');

if (result.error) {
  console.error('Alas! An error:', result.error);
  console.log('Generated code was:', result.code);
} else {
  console.log('Hark! Success! Returned data:', result.result);
}
```

## How the Performance Unfolds

1. **🎭 scene()** - Choose your AI muse (OpenAI, Anthropic, or Google)
2. **📖 toBe()** - Launch a browser session in Kernel's cloud
3. **🎪 beseech()** - The performance:
   - Captures the live page DOM (no blind selector guessing)
   - Feeds your instruction + DOM to the AI
   - AI crafts eloquent Playwright code using *actual* selectors
   - Executes in Kernel's remote browser
   - Returns code, data, and errors
4. **🌙 notToBe()** - Close the session and clean up

**Context memory**: Each `beseech()` remembers previous commands, so the AI builds on earlier actions for smarter automation.

## Why Kernel's Playwright Execution API Excels

ImmortalBard performs upon Kernel's [Playwright Execution API](https://www.onkernel.com/docs/browsers/playwright-execution)—direct VM execution for maximum performance:

### Performance Most Swift

**Direct VM execution.** Code runs in the same VM as the browser:

- ⚡ **Lower latency** - Direct execution, zero roundtrips
- 🚀 **Higher throughput** - Minimal overhead
- 🎯 **Simpler architecture** - No complex connection management
- 🔒 **Bulletproof reliability** - No connection drops or timeout surprises

**Perfect for:**
- Lightning-fast data extraction
- Form automation that performs flawlessly
- High-speed scraping
- Any task where time is of the essence

### The Complete Theatre: Available Playwright Objects

Your AI-generated code has access to the complete Playwright stage:

- **`page`** - Current page (navigation, clicks, typing, waits)
- **`context`** - Browser context (cookies, localStorage, sessionStorage)
- **`browser`** - Browser instance (multi-page ops, new contexts)

### Extracting Data with Grace

Use `return` statements in your natural language commands to pull data back:

```typescript
// Simply beseech for data—the Bard extracts and returns it
const result = await bard.beseech('Get all links on the page');

// AI generates something like:
// const links = await page.$$eval('a', els =>
//   els.map(a => ({ text: a.textContent, href: a.href }))
// );
// return links;

console.log(result.result); // Array of {text, href} objects
```

### DOM-Aware Code Generation: Prescient and True

**The secret art:** Before every `beseech()`, ImmortalBard captures the live page DOM and feeds it to the AI.

**Why this enchants:**
- ✅ Uses *actual* selectors from the page (not mere guesses)
- ✅ Finds elements by their true IDs, classes, and attributes
- ✅ Generates code that stands the test of time

**Configure DOM capture** (optional):

```typescript
await bard.scene({
  provider: 'openai',
  domCapture: {
    enabled: true,      // default: true (highly recommended)
    maxDepth: 5,        // default: 5 (how deep to traverse the DOM tree)
    maxTokens: 4000     // default: 4000 (trim large DOMs to conserve tokens)
  }
});
```

## Requirements: The Theatre's Foundations

- **Node.js 18+** (or whichever version Fortune favors)
- **API keys** for Kernel + at least one AI provider (OpenAI, Anthropic, or Google)

## License

MIT 🎭
