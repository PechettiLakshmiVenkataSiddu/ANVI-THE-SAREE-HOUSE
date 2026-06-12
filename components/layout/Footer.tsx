'use client'

import Link from 'next/link'
import { Share2, Globe, Mail, Heart } from 'lucide-react'
import Newsletter from '@/components/home/Newsletter'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <Newsletter variant="footer" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          
          {/* Column 1 - Photo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <img 
              src="/images/owner.jpg" 
              alt="Owner" 
              style={{ 
                width: '270px', 
                height: '210px', 
                borderRadius: '16px', 
                objectFit: 'cover',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
                maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)'
              }} 
            />
          </div>

          {/* Column 2 - Brand Info */}
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <h4 className="font-serif text-l font-bold mb-4 mt-1 text-[#D4AF37]">ANVI THE SAREE HOUSE</h4>
  <p className="font-serif text-sm opacity-90 mb-2 leading-relaxed">
    ANVI CEO:MEKALA SATISH
  </p>
  <p className="font-serif text-xs opacity-90 mb-2 leading-relaxed">
    MANAGING DIRECTORS:<br />KASI ANNAPURNA, YASWANTH SAI, HEMANTH SAI
  </p>

</div>

          {/* Column 3 - Shop */}
          <div>
            <h4 className="font-bold mb-4 tracking-wide">SHOP</h4>
            <ul className="text-sm space-y-2 opacity-90">
              <li><Link href="/shop" className="hover:opacity-100 transition">All Sarees</Link></li>
              <li><Link href="/shop?filter=new" className="hover:opacity-100 transition">New Arrivals</Link></li>
              <li><Link href="/shop?filter=bestseller" className="hover:opacity-100 transition">Best Sellers</Link></li>
              <li><Link href="/shop?category=wedding" className="hover:opacity-100 transition">Wedding Collection</Link></li>
            </ul>
          </div>

          {/* Column 4 - About */}
          <div>
            <h4 className="font-bold mb-4 tracking-wide">ABOUT</h4>
            <ul className="text-sm space-y-2 opacity-90">
              <li><Link href="/about" className="hover:opacity-100 transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 transition">Contact</Link></li>
              <li><Link href="/orders" className="hover:opacity-100 transition">Track Order</Link></li>
              <li><Link href="/wishlist" className="hover:opacity-100 transition">Wishlist</Link></li>
            </ul>
          </div>

          {/* Column 5 - Contact */}
          <div>
            <h4 className="font-bold mb-4 tracking-wide">CONTACT</h4>
            <div className="text-sm space-y-2 opacity-90">
              <p>Email: anvithesareehouse@gmail.com</p>
              <p>Phone: 8639899155</p>
              <p>WhatsApp: 8639899155</p>
              <p>Open until 9:30 PM</p>
            </div>
            {/* 4 Icon Links */}
  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
    
    {/* WhatsApp */}
    <a
      href="https://wa.me/918639899155?text=Hello%20ANVI%20THE%20SAREE%20HOUSE%2C%20I%20am%20interested%20in%20your%20sarees%20and%20would%20love%20to%20know%20more%20about%20your%20collection!"
      target="_blank"
      rel="noopener noreferrer"
      title="WhatsApp Us"
      style={{ color: '#25D366', fontSize: '18px', lineHeight: 1 }}
    >
      {/* WhatsApp SVG */}
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>

    {/* Phone */}
    <a
      href="tel:+918639899155"
      title="Call Us"
      style={{ color: '#D4AF37', fontSize: '18px', lineHeight: 1 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
      </svg>
    </a>

    {/* Google Maps */}
    <a
      href="https://www.google.com/maps/search/?api=1&query=ANVI+THE+SAREE+HOUSE+PANTI+REVU+ROAD+NARSAPUR+STEAMER+ROAD+near+RAMALAYAM+Narsapur+Andhra+Pradesh+534275"
      target="_blank"
      rel="noopener noreferrer"
      title="Find Us on Map"
      style={{ color: '#EA4335', fontSize: '18px', lineHeight: 1 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </a>

    {/* Instagram */}
    <a
      href="https://www.instagram.com/anvithesareehouse"
      target="_blank"
      rel="noopener noreferrer"
      title="Follow us on Instagram"
      style={{ color: '#E1306C', fontSize: '18px', lineHeight: 1 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </a>

  </div>
          </div>

        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} ANVI THE SAREE HOUSE. All rights reserved.</p>
          <p>all over india free shipment free international shipment cost applicable</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:opacity-100">Privacy Policy</Link>
            <Link href="#" className="hover:opacity-100">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}