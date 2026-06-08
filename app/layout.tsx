import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { AppProviders } from '@/components/providers/AppProviders'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const playfair = Playfair_Display({ variable: '--font-serif', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Saree Elegance - Premium Sarees for Every Occasion',
    template: '%s | Saree Elegance',
  },
  description:
    'Discover timeless sarees with intricate zari weaving and delicate patterns crafted for every celebration. Shop Banarasi, Kanchipuram, Silk, Cotton & Designer sarees.',
  keywords: ['saree', 'banarasi saree', 'silk saree', 'kanchipuram', 'indian saree', 'wedding saree'],
  openGraph: {
    title: 'Saree Elegance - Premium Sarees',
    description: 'Premium sarees for every celebration',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
