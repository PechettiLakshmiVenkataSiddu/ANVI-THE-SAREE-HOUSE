'use client'
import Image from 'next/image'
import { Search, Heart, ShoppingCart, ChevronDown, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/context/cart-context'
import { useWishlist } from '@/lib/context/wishlist-context'
import MobileMenu from '@/components/layout/MobileMenu'
import CartDrawer from '@/components/cart/CartDrawer'
import { categories } from '@/lib/data/categories'
import HeaderUserMenu from '@/components/auth/HeaderUserMenu'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { itemCount: cartCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()

  const [dbCollections, setDbCollections] = useState<{ title: string, slug: string }[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('collections').select('title, slug').eq('is_active', true)
      .then(({ data }) => { if (data) setDbCollections(data) })
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm tracking-wide">
        FREE SHIPPING ALL OVER INDIA | International Shipping Available
      </div>

      <header className="bg-[#FDF0EE] border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <MobileMenu />

           <Link href="/" className="flex-shrink-0 flex flex-col items-center">
  <Image
    src="/images/logo.png"
    alt="ANVI THE SAREE HOUSE"
    width={80}
    height={60}
    className="object-contain"
  />
  <span style={{
    fontFamily: 'Georgia, serif',
    fontSize: '11px',
    letterSpacing: '0.2em',
    color: '#7B2D42',
    fontWeight: '500',
    marginTop: '2px'
  }}>
    ANVI THE SAREE HOUSE
  </span>
</Link>

            <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center text-xs lg:text-sm font-medium">
              <Link href="/" className="text-foreground hover:text-primary transition">
                HOME
              </Link>
              <div className="relative group">
                <Link href="/shop" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                  SHOP <ChevronDown size={14} />
                </Link>
                <div className="absolute left-0 top-full pt-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-card border border-border rounded-md shadow-lg py-1">
                    <Link href="/shop" className="block px-4 py-2 hover:bg-secondary text-sm">
                      All Sarees
                    </Link>
                    {categories.slice(0, 4).map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className="block px-4 py-2 hover:bg-secondary text-sm capitalize"
                      >
                        {cat.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative group">
                <span className="flex items-center gap-1 text-foreground hover:text-primary transition cursor-pointer">
                  COLLECTIONS <ChevronDown size={14} />
                </span>
                <div className="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-card border border-border rounded-md shadow-lg py-1">
                    {dbCollections.map((col) => (
                      <Link
                        key={col.slug}
                        href={`/collections/${col.slug}`}
                        className="block px-4 py-2 hover:bg-secondary text-sm capitalize"
                      >
                        {col.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/shop?filter=new" className="text-foreground hover:text-primary transition">
                NEW ARRIVALS
              </Link>
              <Link href="/shop?filter=bestseller" className="text-foreground hover:text-primary transition">
                BEST SELLERS
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition">
                ABOUT US
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition">
                CONTACT US
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-secondary rounded-full transition"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <HeaderUserMenu />
              <Link href="/wishlist" className="p-2 hover:bg-secondary rounded-full transition relative" aria-label="Wishlist">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 hover:bg-secondary rounded-full transition relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={handleSearch} className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sarees, collections..."
                className="flex-1 px-4 py-2 border border-border rounded-md bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold">
                Search
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 hover:bg-secondary rounded-md">
                <X size={18} />
              </button>
            </form>
          )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
