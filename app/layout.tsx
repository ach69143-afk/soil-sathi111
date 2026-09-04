import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FieldProvider } from '@/components/soil/field-provider'
import { AppShell } from '@/components/shell/app-shell'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })

export const metadata: Metadata = {
  title: 'SOIL SATHI — Smart Soil & NPK Monitoring',
  description:
    'Real-time NPK, moisture, pH and temperature monitoring for your fields, with AI-powered soil and crop guidance from Kisan Sahayak.',
  generator: 'v0.app',
  applicationName: 'SOIL SATHI',
  keywords: ['soil monitoring', 'NPK sensor', 'ESP32', 'agritech', 'precision farming', 'Kisan Sahayak'],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2f5a3c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable} bg-background`}>
      <body className="antialiased">
        <TooltipProvider>
          <FieldProvider>
            <AppShell>{children}</AppShell>
          </FieldProvider>
        </TooltipProvider>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
