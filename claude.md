# ImmortalBard SDK - Development Documentation

This document provides context for Claude to assist with the development of the ImmortalBard SDK.

## Project Overview

ImmortalBard is a natural language browser automation SDK that combines:
- **Vercel AI SDK** for multi-provider LLM integration (OpenAI, Anthropic, Google)
- **Kernel SDK** (@onkernel/sdk) for remote browser infrastructure
- **Natural language processing** to convert instructions into executable Playwright code

### Core Concept

Users write natural language instructions → AI generates Playwright code → Code executes in remote browser via Kernel SDK → Results returned to user

## Architecture

### File Structure

```
ImmortalBard/
├── src/
│   ├── index.ts              # Main exports
│   ├── immortal-bard.ts      # Core ImmortalBard class
│   ├── types.ts              # TypeScript interfaces
│   ├── kernel-client.ts      # Kernel SDK integration
│   ├── code-generator.ts     # AI code generation logic
│   └── config.ts             # Default models & system prompt
├── examples/
│   └── basic-usage.ts        # Usage examples
├── package.json
├── tsconfig.json
├── README.md
└── claude.md                 # This file
```

### Key Components

#### 1. ImmortalBard Class (`src/immortal-bard.ts`)

The main SDK interface with the following lifecycle:

1. **Constructor**: Initialize with API keys (or use env vars)
2. **scene()**: Configure the AI provider (OpenAI, Anthropic, or Google)
3. **toBe()**: Launch a remote browser session via Kernel
4. **beseech()**: Execute natural language instructions
5. **notToBe()**: Close the browser session

**Key Methods:**
- `scene(config: ImmortalBardConfig)` - Sets up AI provider
- `toBe()` - Launches browser session
- `beseech(instruction: string)` - Executes natural language command
- `notToBe()` - Closes session
- `isPerforming()` - Checks if session is active

#### 2. Code Generator (`src/code-generator.ts`)

Handles AI interaction to convert natural language to Playwright code.

**Features:**
- Multi-provider support (OpenAI, Anthropic, Google) via Vercel AI SDK
- Maintains conversation history for context-aware generation
- Generates executable Playwright code
- Uses system prompts (from config.ts) to ensure code quality
- Code cleaning (strips markdown code blocks)
- Temperature: 0.2 for consistency
- Max tokens: 2000

**Key Methods:**
- `setProvider(provider, customModel?)` - Configure AI provider
- `generatePlaywrightCode(instruction)` - Generate code from natural language
- `resetContext()` - Clear conversation history
- `cleanCode(text)` - Strip markdown formatting from generated code

**Implementation Details:**
- Accepts optional API keys in constructor (falls back to env vars)
- Uses `generateText()` from Vercel AI SDK
- Maintains full conversation history including system prompt

#### 3. Kernel Client (`src/kernel-client.ts`)

Manages communication with Kernel SDK for remote browser automation.

**Key Methods:**
- `launchSession()` - Creates new browser session via `kernel.browsers.create()`
- `execute(sessionId, code)` - Runs Playwright code via `kernel.browsers.playwright.execute()`
- `closeSession(sessionId)` - Terminates browser session via `kernel.browsers.deleteByID()`

**Implementation Details:**
- Uses `@onkernel/sdk` package (imported as `Kernel`)
- Initializes Kernel SDK in constructor
- Wraps all SDK calls with error handling
- Returns structured results from Kernel API

#### 4. Types (`src/types.ts`)

Core TypeScript interfaces:

```typescript
export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface ImmortalBardConfig {
  provider: AIProvider;
  model?: string;       // Optional custom model override
}

export interface BeseechResult {
  code: string;         // Generated Playwright code
  result: any;          // Execution result from browser
  error: string | null; // Error message if failed
}

export interface KernelSession {
  session_id: string;   // Note: snake_case from Kernel SDK
  wsEndpoint?: string;
  status?: string;
}

export interface KernelExecutionResult {
  success: boolean;     // Execution status
  result?: unknown;     // Execution result
  error?: string;       // Error message if failed
  stdout?: string;      // Standard output
  stderr?: string;      // Standard error
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

#### 5. Config (`src/config.ts`)

Configuration constants used throughout the SDK.

**Default Models:**
```typescript
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4.1',
  anthropic: 'claude-sonnet-4-5',
  google: 'gemini-2.5-pro',
};
```

**System Prompt:**
Defines instructions for the AI to generate valid Playwright code:
- Generate only valid Playwright TypeScript code
- Use async/await patterns
- Prefer data-testid, then CSS selectors
- Include error handling with try-catch
- Add comments for complex operations
- Use page.waitForSelector() for dynamic content
- Output only executable code (no markdown)
- Assume 'page' variable is available
- Handle timing issues properly

## Development Setup

### Prerequisites
- Node.js 18+
- TypeScript
- API keys for Kernel and at least one AI provider

### Environment Variables
The Kernel SDK automatically uses `KERNEL_API_KEY` from environment. AI provider keys can be set via env vars or constructor:
```bash
KERNEL_API_KEY=your_kernel_api_key    # Required for Kernel SDK
OPENAI_API_KEY=your_openai_key        # Optional (or pass to constructor)
ANTHROPIC_API_KEY=your_anthropic_key  # Optional (or pass to constructor)
GOOGLE_API_KEY=your_google_key        # Optional (or pass to constructor)
```

### Build & Test
```bash
npm install
npm run build      # Compile TypeScript
npm run dev        # Watch mode
npm start          # Run example (basic-usage.ts)
```

## AI Code Generation Flow

### System Prompt Strategy

The code generator uses a system prompt (defined in `src/config.ts`) to ensure:
1. Generated code is valid Playwright TypeScript syntax
2. Code is executable in the Kernel remote browser environment
3. Code handles common browser automation patterns (selectors, waits, error handling)
4. Code is returned without markdown formatting
5. The 'page' object is assumed to be available (no browser/context creation needed)

### Conversation Context

Each `beseech()` call adds to the conversation history:
```typescript
messages: [
  { role: 'system', content: '...' },
  { role: 'user', content: 'Navigate to google.com' },
  { role: 'assistant', content: 'await page.goto(...)' },
  { role: 'user', content: 'Search for AI SDK' },
  // ...
]
```

This enables context-aware automation where later commands can reference earlier actions.

## API Integration Details

### Kernel SDK Integration

The SDK uses `@onkernel/sdk` (v0.17.0) for cloud-based Playwright browser execution:
- **Package**: `@onkernel/sdk`
- **Session Management**: `kernel.browsers.create()` / `kernel.browsers.deleteByID()`
- **Code Execution**: `kernel.browsers.playwright.execute(sessionId, { code })`
- **Authentication**: Automatically uses `KERNEL_API_KEY` environment variable
- **Results**: Returns `{ success, result, error, stdout, stderr }`

### AI Provider Integration

Uses Vercel AI SDK (`ai` v3.0.0) for unified interface across providers:
- **OpenAI** (`@ai-sdk/openai` v0.0.50): Default model `gpt-4.1`
- **Anthropic** (`@ai-sdk/anthropic` v0.0.50): Default model `claude-sonnet-4-5`
- **Google** (`@ai-sdk/google` v0.0.50): Default model `gemini-2.5-pro`

**Generation Parameters:**
- Temperature: 0.2 (for consistency)
- Max Tokens: 2000
- Model function: `generateText()` from Vercel AI SDK

## Common Development Tasks

### Adding a New AI Provider

1. Update `AIProvider` type in [src/types.ts](src/types.ts#L1)
2. Add default model in [src/config.ts](src/config.ts#L3) `DEFAULT_MODELS`
3. Add provider case in [src/code-generator.ts](src/code-generator.ts#L26) `setProvider()` method
4. Import the provider SDK at top of `code-generator.ts`
5. Update package.json dependencies
6. Update this documentation

### Modifying Code Generation Behavior

Edit [src/code-generator.ts](src/code-generator.ts):
- Update [src/config.ts](src/config.ts#L9) `SYSTEM_PROMPT` for different code patterns
- Adjust temperature/maxTokens in `generatePlaywrightCode()` method
- Modify `cleanCode()` method for different output formatting
- Use `resetContext()` to clear conversation history

### Adding New ImmortalBard Methods

1. Add method to `ImmortalBard` class in [src/immortal-bard.ts](src/immortal-bard.ts)
2. Add type definitions to [src/types.ts](src/types.ts) if needed
3. Export types from [src/index.ts](src/index.ts) if public API
4. Update README.md API reference
5. Add example usage to [examples/basic-usage.ts](examples/basic-usage.ts)

## Error Handling Patterns

### Three Levels of Errors

1. **Configuration Errors**: Missing API keys, provider not set, invalid config
   - Thrown during `scene()` if API key not found
   - Thrown during `toBe()` if scene not set
   - Thrown during `beseech()` if no active session

2. **Code Generation Errors**: AI fails to generate code
   - Caught in `beseech()` method
   - Returned in `BeseechResult.error` field
   - Original code field is empty string

3. **Execution Errors**: Code fails in remote browser
   - Caught in `beseech()` method after successful code generation
   - Returned in `BeseechResult.error` field
   - Generated code is still included in `code` field

**Error Result Pattern:**
```typescript
{
  code: string,      // Generated code (empty if generation failed)
  result: any,       // null if error occurred
  error: string | null  // Error message or null if successful
}
```

**Cleanup on Exit:**
The `toBe()` method registers a `beforeExit` handler to automatically call `notToBe()` and clean up browser sessions.

## Testing Strategy

### Manual Testing
Run the example script which tests the full workflow:
```bash
npm start  # Runs examples/basic-usage.ts with dotenv config
```

The example demonstrates:
1. Initializing ImmortalBard with API keys from `.env`
2. Setting the scene with OpenAI provider
3. Entering the stage (launching a browser session)
4. Executing multiple natural language commands in sequence
5. Properly exiting the stage (closing the session)

### Integration Testing
Currently uses manual integration testing against:
- Real Kernel SDK API (requires `KERNEL_API_KEY`)
- Real AI provider APIs (requires provider API keys)
- No mocking - tests actual end-to-end functionality

## Version History

- **v0.1.0**: Initial SDK release
  - Core ImmortalBard class with lifecycle methods
  - Multi-provider AI support (OpenAI, Anthropic, Google)
  - Kernel SDK integration for remote browsers
  - Conversation context management
  - Error handling at all levels
  - Basic example implementation

## Dependencies

**Core Dependencies:**
- `ai` (^3.0.0) - Vercel AI SDK core
- `@ai-sdk/openai` (^0.0.50) - OpenAI provider
- `@ai-sdk/anthropic` (^0.0.50) - Anthropic provider
- `@ai-sdk/google` (^0.0.50) - Google provider
- `@onkernel/sdk` (^0.17.0) - Kernel remote browser SDK

**Dev Dependencies:**
- `typescript` (^5.0.0)
- `@types/node` (^20.0.0)
- `dotenv` (^16.0.0)

## Future Development Ideas

- Add retry logic for failed executions
- Support for multiple concurrent sessions
- Screenshot/video capture capabilities from Kernel
- Advanced Playwright features (network interception, console logs, etc.)
- Local browser mode option (not just remote)
- Caching of generated code patterns
- Better error recovery and AI-suggested fixes
- Streaming response support
- Session state persistence
- Browser session pooling

## Important Notes for Claude

1. **Naming Convention**: The SDK uses Shakespeare theatrical metaphors:
   - `scene()` - Configure AI provider (set the scene for the performance)
   - `toBe()` - Connect to browser (enter the stage - "To be or not to be")
   - `beseech()` - Execute commands (beseech the Bard for action)
   - `notToBe()` - Disconnect (exit the stage - "not to be")
   - `isPerforming()` - Check if session is active

2. **Architecture Pattern**:
   - ImmortalBard class orchestrates everything
   - CodeGenerator handles AI interaction
   - KernelClient handles browser interaction
   - Config file contains constants (models, prompts)
   - Types file defines all interfaces

3. **State Management**:
   - `currentSessionId` tracks active browser session
   - `isSceneSet` ensures provider is configured
   - Conversation history maintained in CodeGenerator
   - Process exit handler for cleanup

4. **Breaking Changes**: This is v0.1.0, so API changes are acceptable. Document them clearly in version history.

5. **Dependencies**:
   - Uses Vercel AI SDK (`ai`, `@ai-sdk/*`) for LLM providers
   - Uses Kernel SDK (`@onkernel/sdk`) for remote browsers
   - No local Playwright dependency (all execution is remote)

6. **Type Safety**: Maintain full TypeScript type coverage for good DX.

7. **API Key Management**:
   - Constructor params take precedence
   - Falls back to environment variables
   - Kernel SDK automatically uses `KERNEL_API_KEY` env var

8. **Error Philosophy**: Never throw from `beseech()` - always return structured result with error field.
