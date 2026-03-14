import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Research — Arc Demo',
  description: 'AI-powered research assistant, powered by Arc',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
