import { config } from 'dotenv';
import { streamText } from 'ai';

// Load the gateway key from .env.local (server-side secret; .env* is gitignored).
config({ path: '.env.local' });

async function main() {
  // With the AI SDK, a bare 'provider/model' string routes through the
  // Vercel AI Gateway using AI_GATEWAY_API_KEY.
  const result = streamText({
    model: 'openai/gpt-5.4',
    prompt: 'Write a short haiku about connection.',
  });

  // Stream the response to stdout as it arrives.
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  // Token usage resolves once the stream completes.
  const usage = await result.usage;
  console.log('\n\n--- Token usage ---');
  console.log(`Input tokens:  ${usage.inputTokens}`);
  console.log(`Output tokens: ${usage.outputTokens}`);
  console.log(`Total tokens:  ${usage.totalTokens}`);
}

main().catch((err) => {
  console.error('AI Gateway request failed:', err);
  process.exit(1);
});
