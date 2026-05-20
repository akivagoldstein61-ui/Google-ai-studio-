import { gateway } from '@ai-sdk/gateway'
import { streamText } from 'ai'

if (!process.env.VERCEL_OIDC_TOKEN) {
  console.error('Missing VERCEL_OIDC_TOKEN. Run `vc env pull .env.local` before running this script.')
  process.exit(1)
}

try {
  const result = streamText({
    model: gateway('openai/gpt-5.5'),
    prompt: 'Explain quantum computing in simple terms.',
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`AI Gateway request failed: ${message}`)
  process.exit(1)
}
