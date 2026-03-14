import { NextRequest } from 'next/server'
import { arcStream, truncateDoc, Message } from '@/lib/arc'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, messages } = body as { text?: string; messages?: Message[] }

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: 'No document text provided' }), { status: 400 })
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 })
    }

    const docContext: Message = {
      role: 'system',
      content: `You are a research assistant. The following is the document the user is asking about:\n\n${truncateDoc(text)}`,
    }

    const allMessages: Message[] = [docContext, ...messages]
    const stream = await arcStream('research-qa', allMessages)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
