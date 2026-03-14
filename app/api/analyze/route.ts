import { NextRequest } from 'next/server'
import { arcStream, truncateDoc, Message } from '@/lib/arc'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, type } = body as { text?: string; type?: 'summarize' | 'keypoints' }

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: 'No text provided' }), { status: 400 })
    }
    if (type !== 'summarize' && type !== 'keypoints') {
      return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 })
    }

    const route = type === 'summarize' ? 'research-summarize' : 'research-keypoints'
    const messages: Message[] = [
      { role: 'user', content: truncateDoc(text) },
    ]

    const stream = await arcStream(route, messages)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
