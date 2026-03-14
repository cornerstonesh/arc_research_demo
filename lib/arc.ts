export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function getArcHeaders(route: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.ARC_API_KEY}`,
    'X-Arc-Route': route,
  }
}

/**
 * Non-streaming Arc call. Returns the assistant message content.
 */
export async function arcComplete(
  route: string,
  messages: Message[],
): Promise<string> {
  const res = await fetch(
    `${process.env.ARC_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: getArcHeaders(route),
      body: JSON.stringify({ messages, stream: false }),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Arc error (${route}): ${res.status} — ${text}`)
  }

  const data = await res.json()
  return data.choices[0].message.content as string
}

/**
 * Streaming Arc call. Returns the raw ReadableStream from the Arc response.
 * The caller is responsible for piping/returning this stream.
 */
export async function arcStream(
  route: string,
  messages: Message[],
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(
    `${process.env.ARC_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: getArcHeaders(route),
      body: JSON.stringify({ messages, stream: true }),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Arc error (${route}): ${res.status} — ${text}`)
  }

  return res.body!
}

/** Truncate document text to stay within model context limits. */
export function truncateDoc(text: string, maxChars = 50000): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n\n[Document truncated for length]'
}
