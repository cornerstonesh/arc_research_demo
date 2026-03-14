import { NextRequest, NextResponse } from 'next/server'
import { arcComplete, truncateDoc, Message } from '@/lib/arc'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body as { text?: string }
    if (!text?.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const messages: Message[] = [
      { role: 'user', content: truncateDoc(text) },
    ]

    const raw = await arcComplete('research-classify', messages)
    // The route returns a single category label. Normalize to one of the known values.
    const known = ['Legal', 'Medical', 'Finance', 'Technical', 'Research']
    const category = known.find(c => raw.toLowerCase().includes(c.toLowerCase())) ?? 'Research'

    return NextResponse.json({ category })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Classification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
