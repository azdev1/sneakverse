'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Search, RotateCcw, Activity } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';

const FALLBACK_PRODUCTS = [
  {
    _id: "quantum_fallback_id",
    name: "SneakVerse Quantum",
    brand: "SneakVerse",
    category: "Running Shoes",
    description: "Step into the next dimension of comfort and performance. Reactive mesh uppers with a cybernetic frame.",
    price: 220,
    rating: 4.8,
    numReviews: 3,
    image: "/uploads/sneaker-quantum.png",
    images: [],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: [
      { "name": "Cyber Obsidian", "hex": "#0a0a0a" },
      { "name": "Neon Blue", "hex": "#00f0ff" },
      { "name": "Neon Orange", "hex": "#ff5500" },
      { "name": "Titanium Silver", "hex": "#c0c0c0" }
    ],
    stock: 15,
    isFeatured: true
  },
  {
    _id: "aerostratus_fallback_id",
    name: "AeroStratus Basketball",
    brand: "SneakVerse",
    category: "Basketball Shoes",
    description: "Defy gravity on the court. Carbon fiber stabilizers and multi-directional grip.",
    price: 260,
    rating: 4.9,
    numReviews: 2,
    image: "/uploads/sneaker-aerostratus.png",
    images: [],
    sizes: [8, 9, 10, 11, 12, 13],
    colors: [
      { "name": "Pure Metallic White", "hex": "#ffffff" },
      { "name": "Hyper Crimson", "hex": "#ff0033" },
      { "name": "Voltage Purple", "hex": "#7a00ff" }
    ],
    stock: 8,
    isFeatured: true
  },
  {
    _id: "hypernebula_fallback_id",
    name: "HyperNebula Limited Edition",
    brand: "SneakVerse",
    category: "Limited Editions",
    description: "A collector's item crafted for the streets. Glow in the dark highlights.",
    price: 380,
    rating: 5.0,
    numReviews: 2,
    image: "/uploads/sneaker-hypernebula.png",
    images: [],
    sizes: [8, 9, 10, 11, 12],
    colors: [
      { "name": "Deep Obsidian", "hex": "#121212" },
      { "name": "Nebula Green", "hex": "#39ff14" },
      { "name": "Glow Yellow", "hex": "#e0fe00" }
    ],
    stock: 3,
    isFeatured: true
  },
  {
    _id: "apexrunner_fallback_id",
    name: "ApexRunner Pro",
    brand: "SneakVerse",
    category: "Sports Collection",
    description: "Ultra-lightweight racer built for record breaking speed.",
    price: 210,
    rating: 4.6,
    numReviews: 1,
    image: "/uploads/sneaker-apex.png",
    images: [],
    sizes: [7, 8, 9, 10, 11],
    colors: [
      { "name": "Cyber Green", "hex": "#00ff66" },
      { "name": "Volt Yellow", "hex": "#ccff00" },
      { "name": "Pitch Black", "hex": "#000000" }
    ],
    stock: 20,
    isFeatured: false
  },
  {
    _id: "retrovibe_fallback_id",
    name: "RetroVibe Cyberpunk",
    brand: "SneakVerse",
    category: "Casual Sneakers",
    description: "Nostalgic silhouette meets future street tech. Vintage gum midsoles.",
    price: 175,
    rating: 4.7,
    numReviews: 2,
    image: "/uploads/sneaker-retrovibe.png",
    images: [],
    sizes: [6, 7, 8, 9, 10, 11, 12],
    colors: [
      { "name": "Cyberpunk Pink", "hex": "#ff007f" },
      { "name": "Gum Retro White", "hex": "#f5f5dc" },
      { "name": "Matte Charcoal", "hex": "#2b2b2b" }
    ],
    stock: 25,
    isFeatured: false
  }
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialKeyword = searchParams.get('keyword') || '';

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSize, setSelectedSize] = useState('');
  const [maxPrice, setMaxPrice] = useState(400);
  const [sortBy, setSortBy] = useState('newest');

  // Trigger search value sync when navigation bar changes search query
  useEffect(() => {
    setSearch(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Fetch all products on load
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.warn('Backend offline. Loading local JSON fallback catalog.', err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Filter application
  useEffect(() => {
    let result = [...products];

    // Search Keyword filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Size filter
    if (selectedSize) {
      result = result.filter((p) => p.sizes.includes(Number(selectedSize)));
    }

    // Max Price filter
    result = result.filter((p) => p.price <= maxPrice);

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [products, search, selectedCategory, selectedSize, maxPrice, sortBy]);

  const categories = [
    'Running Shoes',
    'Basketball Shoes',
    'Casual Sneakers',
    'Limited Editions',
    'Sports Collection'
  ];

  const sizesList = [6, 7, 8, 9, 10, 11, 12, 13];

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSize('');
    setMaxPrice(400);
    setSortBy('newest');
  };

  return (
    <>
      {isLoading && <Loader />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Title */}
        <div className="border-b border-white/5 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider text-white">SneakVerse Shop</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              Explore {filteredProducts.length} Premium Configurations
            </p>
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="newest" className="bg-[#0f0f12] text-white">New Arrivals</option>
              <option value="price-low" className="bg-[#0f0f12] text-white">Price: Low to High</option>
              <option value="price-high" className="bg-[#0f0f12] text-white">Price: High to Low</option>
              <option value="rating" className="bg-[#0f0f12] text-white">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR FILTERS (4 columns) */}
          <div className="lg:col-span-3 glass p-6 rounded-2xl border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-accent" />
                Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-gray-500 hover:text-accent uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={10} />
                Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Search Catalog</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-4 pr-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <Search size={14} className="absolute right-3 top-2.5 text-gray-500" />
              </div>
            </div>

            {/* Category Selectors */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Shoe Discipline</label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`text-left px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    selectedCategory === ''
                      ? 'bg-accent/20 border-l-2 border-accent text-white'
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  All Disciplines
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      selectedCategory === cat
                        ? 'bg-accent/20 border-l-2 border-accent text-white'
                        : 'hover:bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selectors */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Select Size (US Men)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {sizesList.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === String(sz) ? '' : String(sz))}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      selectedSize === String(sz)
                        ? 'bg-accent text-black border-accent'
                        : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-gray-500">Max Budget</span>
                <span className="text-accent">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="150"
                max="400"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

          </div>

          {/* RIGHT PRODUCTS GRID (9 columns) */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="glass p-12 rounded-3xl border-white/5 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
                <Activity size={36} className="text-gray-600 animate-pulse" />
                <div>
                  <h3 className="text-white font-bold text-lg">No Sneakers Match Your Filters</h3>
                  <p className="text-gray-500 text-xs mt-1">Try resetting size filters, price ranges, or modifying your search query.</p>
                </div>
                <button
                  onClick={resetFilters}
                  className="py-2.5 px-6 rounded-full bg-accent text-black font-black uppercase text-xs tracking-widest hover:bg-accent/80 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<Loader />}>
      <ShopContent />
    </Suspense>
  );
}
