import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Probe',
  description: 'Share your probe from The One and the 99',
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