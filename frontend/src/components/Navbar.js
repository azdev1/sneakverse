'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  Sliders 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, wishlist } = useAuth();
  const { cartItemsCount, toggleCart } = useCart();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll handler for translucent navbar effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme toggle handler
  const toggleTheme = () => {
    const doc = document.documentElement;
    if (isDarkMode) {
      doc.classList.add('light-mode');
    } else {
      doc.classList.remove('light-mode');
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-widest text-white uppercase bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                SneakVerse
              </span>
            </Link>
          </div>

          {/* Center navigation links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-accent transition-colors">Home</Link>
            <Link href="/shop?category=Running Shoes" className="text-sm font-medium hover:text-accent transition-colors">Running</Link>
            <Link href="/shop?category=Basketball Shoes" className="text-sm font-medium hover:text-accent transition-colors">Basketball</Link>
            <Link href="/shop?category=Casual Sneakers" className="text-sm font-medium hover:text-accent transition-colors">Casual</Link>
            <Link href="/shop?category=Limited Editions" className="text-sm font-medium hover:text-accent transition-colors">Limited</Link>
          </div>

          {/* Search and interactive icons */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search sneakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-white/5 border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent transition-all duration-300 focus:w-60 text-white"
              />
              <button type="submit" className="absolute right-3 top-2 text-gray-400 hover:text-accent">
                <Search size={14} />
              </button>
            </form>

            {/* Dark Mode Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-accent transition-all">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            <Link href="/profile" className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-accent transition-all">
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-black bg-accent rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-accent transition-all">
              <ShoppingBag size={18} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-black bg-accent rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Link href={user.isAdmin ? '/admin' : '/profile'} className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-accent transition-colors font-medium">
                  {user.isAdmin ? <Sliders size={15} /> : <User size={15} />}
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </Link>
                <button onClick={logout} className="p-1.5 rounded-full hover:bg-white/5 text-red-400 hover:text-red-500 transition-all">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium hover:text-accent transition-colors pl-2 border-l border-white/10 text-white">
                <User size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Cart Icon Mobile */}
            <button onClick={toggleCart} className="relative p-2 text-gray-300 hover:text-accent">
              <ShoppingBag size={18} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-black bg-accent rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-300 hover:text-accent">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/10 mt-2 px-4 py-4 space-y-4">
          <div className="flex flex-col space-y-2">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium py-2 border-b border-white/5 hover:text-accent">Home</Link>
            <Link href="/shop?category=Running Shoes" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium py-2 border-b border-white/5 hover:text-accent">Running Shoes</Link>
            <Link href="/shop?category=Basketball Shoes" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium py-2 border-b border-white/5 hover:text-accent">Basketball Shoes</Link>
            <Link href="/shop?category=Casual Sneakers" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium py-2 border-b border-white/5 hover:text-accent">Casual Sneakers</Link>
            <Link href="/shop?category=Limited Editions" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium py-2 border-b border-white/5 hover:text-accent">Limited Editions</Link>
          </div>

          {/* Search bar mobile */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search sneakers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-xs text-white"
            />
            <button type="submit" className="absolute right-3 top-2 text-gray-400">
              <Search size={14} />
            </button>
          </form>

          {/* Mobile utility buttons */}
          <div className="flex justify-between items-center pt-2">
            <button onClick={toggleTheme} className="flex items-center gap-2 text-xs text-gray-400">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-xs text-gray-400">
              <Heart size={16} />
              <span>Wishlist ({wishlist.length})</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-white/10">
            {user ? (
              <div className="flex items-center justify-between">
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-white font-semibold">
                  <User size={16} />
                  <span>{user.name} {user.isAdmin && '(Admin)'}</span>
                </Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-xs text-red-400 font-medium">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-accent font-semibold">
                <User size={16} />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
