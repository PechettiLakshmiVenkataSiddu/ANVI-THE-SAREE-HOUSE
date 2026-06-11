'use client'

import Link from 'next/link'
import { Share2, Globe, Mail, Heart } from 'lucide-react'
import Newsletter from '@/components/home/Newsletter'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <Newsletter variant="footer" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px', maxWidth: '220px' }}>
            <img src="/images/owner.jpg" alt="Owner" style={{ display: 'block', width: '180px', height: '200px', borderRadius: '16px', objectFit: 'cover', WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)', maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)' }} />
            <h4 className="font-serif text-xl font-bold mb-4">ANVI THE SAREE HOUSE</h4>
            <p className="text-sm opacity-90 leading-relaxed">
              Premium sarees for every celebration. Timeless beauty with intricate zari weaving and delicate patterns.
            </p>
            <div className="flex gap-3 mt-4">
              {[Share2, Globe, Mail, Heart].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition"
                  aria-label="Social link"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 tracking-wide">SHOP</h4>
            <ul className="text-sm space-y-2 opacity-90">
              <li><Link href="/shop" className="hover:opacity-100 transition">All Sarees</Link></li>
              <li><Link href="/shop?filter=new" className="hover:opacity-100 transition">New Arrivals</Link></li>
              <li><Link href="/shop?filter=bestseller" className="hover:opacity-100 transition">Best Sellers</Link></li>
              <li><Link href="/shop?category=wedding" className="hover:opacity-100 transition">Wedding Collection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 tracking-wide">ABOUT</h4>
            <ul className="text-sm space-y-2 opacity-90">
              <li><Link href="/about" className="hover:opacity-100 transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 transition">Contact</Link></li>
              <li><Link href="/orders" className="hover:opacity-100 transition">Track Order</Link></li>
              <li><Link href="/wishlist" className="hover:opacity-100 transition">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 tracking-wide">CONTACT</h4>
            <div className="text-sm space-y-2 opacity-90">
              <p>Email: info@anvithesareehouse.com</p>
              <p>Phone: 08639899155</p>
              <p>WhatsApp: 08639899155</p>
              <p>Open until 9:30 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} ANVI THE SAREE HOUSE. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:opacity-100">Privacy Policy</Link>
            <Link href="#" className="hover:opacity-100">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
