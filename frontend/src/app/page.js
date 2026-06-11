'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  RotateCw,
  Settings,
  Maximize2,
  Compass,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import Canvas3D from '../components/Canvas3D';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Link from 'next/link';

const FALLBACK_PRODUCTS = [
  {
    _id: "quantum_fallback_id",
    name: "SneakVerse Quantum",
    brand: "SneakVerse",
    category: "Running Shoes",
    description: "Step into the next dimension of comfort and performance.",
    price: 220,
    rating: 4.8,
    numReviews: 3,
    image: "/uploads/sneaker-quantum.png",
    images: [],
    sizes: [8, 9, 10, 11],
    colors: [
      { "name": "Cyber Obsidian", "hex": "#0a0a0a" },
      { "name": "Neon Blue", "hex": "#00f0ff" },
      { "name": "Neon Orange", "hex": "#ff5500" }
    ],
    stock: 15,
    isFeatured: true
  },
  {
    _id: "aerostratus_fallback_id",
    name: "AeroStratus Basketball",
    brand: "SneakVerse",
    category: "Basketball Shoes",
    description: "Defy gravity on the court.",
    price: 260,
    rating: 4.9,
    numReviews: 2,
    image: "/uploads/sneaker-aerostratus.png",
    images: [],
    sizes: [9, 10, 11, 12],
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
    description: "A collector's item crafted for the streets.",
    price: 380,
    rating: 5.0,
    numReviews: 2,
    image: "/uploads/sneaker-hypernebula.png",
    images: [],
    sizes: [8, 9, 10, 11],
    colors: [
      { "name": "Deep Obsidian", "hex": "#121212" },
      { "name": "Nebula Green", "hex": "#39ff14" }
    ],
    stock: 3,
    isFeatured: true
  }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Customizer States
  const [bodyColor, setBodyColor] = useState('#0a0a0a');
  const [soleColor, setSoleColor] = useState('#00f0ff');
  const [lacesColor, setLacesColor] = useState('#ffffff');
  const [swooshColor, setSwooshColor] = useState('#ff5500');
  const [cameraPreset, setCameraPreset] = useState('side');
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        // Display isFeatured products or fall back
        setProducts(data.filter(p => p.isFeatured) || data.slice(0, 3));
      } catch (err) {
        console.warn('API unavailable, loading local fallback catalog.', err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        // Force loading animation to show for premium transition
        setTimeout(() => {
          setIsLoading(false);
        }, 1200);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Running Shoes', icon: <Activity className="text-accent" />, count: '14 Models', path: '/shop?category=Running%20Shoes', bg: 'bg-gradient-to-br from-blue-900/40 to-black/80' },
    { name: 'Basketball Shoes', icon: <Compass className="text-purple-400" />, count: '8 Models', path: '/shop?category=Basketball%20Shoes', bg: 'bg-gradient-to-br from-purple-900/40 to-black/80' },
    { name: 'Casual Sneakers', icon: <Sparkles className="text-emerald-400" />, count: '22 Models', path: '/shop?category=Casual%20Sneakers', bg: 'bg-gradient-to-br from-emerald-900/40 to-black/80' },
    { name: 'Limited Editions', icon: <Zap className="text-amber-400" />, count: '3 Models', path: '/shop?category=Limited%20Editions', bg: 'bg-gradient-to-br from-amber-900/40 to-black/80' },
  ];

  return (
    <>
      {isLoading && <Loader />}

      <div className="w-full flex flex-col min-h-screen">

        {/* HERO SECTION */}
        <section className="relative w-full min-h-[calc(100vh-4rem)] flex items-center bg-radial from-gray-900/30 to-[#030303] overflow-hidden px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

            {/* Left Info Panel */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-black tracking-widest text-accent uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  Season 2026 Collection
                </div>
                <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tight leading-none text-white">
                  Step Into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple-500 neon-glow">
                    The Future.
                  </span>
                </h1>
                <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                  Design, rotate, and color-spec your futuristic footwear in real-time. Custom-crafted comfort fused with Apple-grade aesthetics.
                </p>
              </motion.div>

              {/* 3D Customizer Console */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass p-5 rounded-2xl border-white/5 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-white font-bold uppercase tracking-wider">
                    <Settings size={14} className="text-accent animate-spin-slow" />
                    <span>Real-time Customizer</span>
                  </div>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-all ${autoRotate
                      ? 'bg-accent/25 border-accent text-accent'
                      : 'border-white/10 text-gray-400 hover:text-white'
                      }`}
                  >
                    <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
                    <span className="text-[10px] font-bold">Spin</span>
                  </button>
                </div>

                {/* Color Swatch Selectors */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* Body Color */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Main Upper Body</label>
                    <div className="flex gap-1.5">
                      {[
                        '#0a0a0a',
                        '#ffffff',
                        '#1e293b',
                        '#64748b',
                        '#dc2626'
                      ].map(color => (<button
                        key={color}
                        onClick={() => setBodyColor(color)}
                        className={`w-5 h-5 rounded-full border ${bodyColor === color ? 'border-accent scale-110' : 'border-white/10'}`}
                        style={{ backgroundColor: color }}
                      />
                      ))}
                    </div>
                  </div>

                  {/* Sole Color */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Midsole Pods</label>
                    <div className="flex gap-1.5">
                      {[
                        '#000000',
                        '#ffffff',
                        '#00f0ff',
                        '#a855f7',
                        '#10b981'
                      ].map(color => (
                        <button
                          key={color}
                          onClick={() => setSoleColor(color)}
                          className={`w-5 h-5 rounded-full border ${soleColor === color ? 'border-accent scale-110' : 'border-white/10'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Swoosh Color */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Side Swoosh Accent</label>
                    <div className="flex gap-1.5">
                      {[
                        '#000000',
                        '#ffffff',
                        '#ff5500',
                        '#ffd700',
                        '#ff007f',
                        '#00ff66'
                      ].map(color => (
                        <button
                          key={color}
                          onClick={() => setSwooshColor(color)}
                          className={`w-5 h-5 rounded-full border ${swooshColor === color ? 'border-accent scale-110' : 'border-white/10'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Laces Color */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">
                      Physical Laces
                    </label>
                    <div className="flex gap-1.5">
                      {[
                        '#ffffff', // white
                        '#000000', // black
                        '#ccff00', // lime
                        '#ff0033', // red
                        '#00f0ff'  // cyan
                      ].map(color => (

                        <button
                          key={color}
                          onClick={() => setLacesColor(color)}
                          className={`w-5 h-5 rounded-full border ${lacesColor === color ? 'border-accent scale-110' : 'border-white/10'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Camera presets view selectors */}
                <div className="pt-2 border-t border-white/5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Camera Angle Presets</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['side', 'top', 'front', 'back'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          setCameraPreset(preset);
                          setAutoRotate(false); // Stop spin for preset inspection
                        }}
                        className={`py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-all ${cameraPreset === preset
                          ? 'bg-accent text-black border-accent'
                          : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-4 pt-2"
              >
                <a
                  href="#featured"
                  className="py-3 px-8 rounded-full bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-accent hover:shadow-lg hover:shadow-accent/15 transition-all flex items-center gap-2"
                >
                  <span>Explore Collection</span>
                  <ArrowRight size={14} />
                </a>

                <Link
                  href="/shop"
                  className="py-3 px-6 rounded-full glass hover:bg-white/5 border-white/10 text-white font-extrabold text-xs tracking-widest uppercase transition-all"
                >
                  Direct Shop
                </Link>
              </motion.div>
            </div>

            {/* Right Interactive 3D Model Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 h-[350px] sm:h-[450px] lg:h-[550px] w-full relative group border border-white/5 rounded-3xl glass/10 shadow-2xl flex items-center justify-center"
            >
              {/* Fullscreen canvas callouts */}
              <div className="absolute top-4 left-6 z-10 flex flex-col pointer-events-none">
                <span className="text-white font-black text-xs uppercase tracking-widest">SNEAKVERSE Custom R3F Engine</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Drag to rotate • Scroll to zoom</span>
              </div>

              <div className="absolute bottom-4 right-6 z-10 flex gap-2 items-center pointer-events-none">
                <Maximize2 size={12} className="text-gray-500" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">3D Renderer V1.4.0</span>
              </div>

              {/* 3D Canvas element wrapper */}
              <Canvas3D
                bodyColor={bodyColor}
                soleColor={soleColor}
                lacesColor={lacesColor}
                swooshColor={swooshColor}
                autoRotate={autoRotate}
                cameraPreset={cameraPreset}
              />
            </motion.div>

          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#030303]">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-[10px] text-accent font-black tracking-widest uppercase">High Performance Segments</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Shoe Disciplines</h2>
              <div className="w-12 h-[2px] bg-accent mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, index) => (
                <Link
                  href={cat.path}
                  key={cat.name}
                  className={`group block p-6 rounded-2xl border border-white/5 hover:border-accent/40 ${cat.bg} transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-15 group-hover:scale-125 transition-all duration-500 text-white scale-110">
                    {cat.icon}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 group-hover:border-accent/30 transition-all">
                    {cat.icon}
                  </div>
                  <h3 className="text-base font-black uppercase text-white tracking-wide">{cat.name}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">{cat.count}</p>

                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-accent group-hover:translate-x-1.5 transition-transform duration-300 uppercase tracking-widest">
                    <span>Enter Category</span>
                    <ArrowRight size={10} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED SNEAKERS GRID */}
        <section id="featured" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#060608] border-t border-white/5">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-accent font-black tracking-widest uppercase">Premium Selected</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white">Featured Drops</h2>
                <div className="w-12 h-[2px] bg-accent mt-2" />
              </div>
              <Link
                href="/shop"
                className="text-xs font-black uppercase text-gray-400 hover:text-accent tracking-widest flex items-center gap-1.5 transition-colors self-start"
              >
                <span>View Full Catalog</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Product card lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

