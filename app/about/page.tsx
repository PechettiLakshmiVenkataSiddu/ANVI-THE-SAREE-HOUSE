import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Saree Elegance - premium sarees crafted for every celebration.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">About Saree Elegance</h1>
        <div className="prose prose-neutral max-w-none space-y-4 text-foreground/90">
          <p>
            Saree Elegance is a premium destination for authentic Indian sarees. From the timeless Banarasi weaves of
            Varanasi to the temple-inspired Kanchipuram silks, we curate collections that celebrate India&apos;s rich
            textile heritage.
          </p>
          <p>
            Every saree in our collection is selected for its craftsmanship, quality of fabric, and design excellence.
            Whether you&apos;re preparing for a wedding, a festive celebration, or simply want to add elegance to your
            everyday wardrobe, we have something special for you.
          </p>
          <h2 className="text-xl font-serif font-bold pt-4">Our Promise</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>100% authentic fabrics and traditional weaving techniques</li>
            <li>Free shipping on orders above ₹1999</li>
            <li>Easy 7-day returns on unworn items</li>
            <li>Secure payment options</li>
            <li>Dedicated customer support</li>
          </ul>
        </div>
      </div>

      <Footer />
    </main>
  )
}
