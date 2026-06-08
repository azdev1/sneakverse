'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Info, 
  MessageSquare, 
  ArrowLeft, 
  RotateCw,
  Plus,
  Maximize2
} from 'lucide-react';
import Canvas3D from '../../../components/Canvas3D';
import ProductCard from '../../../components/ProductCard';
import Loader from '../../../components/Loader';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

const FALLBACK_PRODUCTS = [
  {
    _id: "quantum_fallback_id",
    name: "SneakVerse Quantum",
    brand: "SneakVerse",
    category: "Running Shoes",
    description: "Step into the next dimension of comfort and performance. The SneakVerse Quantum features reactive mesh uppers, a cybernetic support frame, and our proprietary energy-returning cushion sole.",
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
    isFeatured: true,
    specs: {
      "Weight": "280g",
      "Midsole Drop": "8mm",
      "Upper Material": "QuantumMesh Engine v2",
      "Sole Tech": "AeroFoam Cushioning"
    },
    reviews: [
      { name: "Alex Mercer", rating: 5, comment: "Absolutely incredible. Looks unreal.", createdAt: "2026-05-10T10:00:00Z" }
    ]
  },
  {
    _id: "aerostratus_fallback_id",
    name: "AeroStratus Basketball",
    brand: "SneakVerse",
    category: "Basketball Shoes",
    description: "Defy gravity on the court. Engineered with high-top ankle locking collars, carbon fiber stabilizers, and multi-directional herringbone grip.",
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
    isFeatured: true,
    specs: {
      "Support": "High-top Lockout",
      "Shank": "Carbon Fiber Plate",
      "Outsole": "Wet-Grip Rubber"
    },
    reviews: []
  },
  {
    _id: "hypernebula_fallback_id",
    name: "HyperNebula Limited Edition",
    brand: "SneakVerse",
    category: "Limited Editions",
    description: "A collector's item crafted for the streets. Features premium full-grain leather, holographic panels, and glow-in-the-dark highlights.",
    price: 380,
    rating: 5.0,
    numReviews: 2,
    image: "/uploads/sneaker-hypernebula.png",
    images: [],
    sizes: [8, 9, 10, 11, 12],
    colors: [
      { "name": "Deep Obsidian", "hex": "#121212" },
      { "name": "Nebula Green", "hex": "#39ff14" }
    ],
    stock: 3,
    isFeatured: true,
    specs: {
      "Reflectivity": "3M Panels",
      "Leather": "Nappa Full Grain"
    },
    reviews: []
  }
];

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, token, toggleWishlist, isInWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Active Selections
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Customizer Controls
  const [bodyColor, setBodyColor] = useState('#0a0a0a');
  const [soleColor, setSoleColor] = useState('#00f0ff');
  const [lacesColor, setLacesColor] = useState('#ffffff');
  const [swooshColor, setSwooshColor] = useState('#ff5500');
  const [cameraPreset, setCameraPreset] = useState('side');
  const [autoRotate, setAutoRotate] = useState(true);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        
        setProduct(data);
        setupDefaults(data);
        fetchRelated(data.category);
      } catch (err) {
        console.warn('API error, retrieving fallback data.', err);
        const fallback = FALLBACK_PRODUCTS.find(p => p._id === id) || FALLBACK_PRODUCTS[0];
        setProduct(fallback);
        setupDefaults(fallback);
        setRelated(FALLBACK_PRODUCTS.filter(p => p._id !== fallback._id));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const setupDefaults = (data) => {
    setSelectedSize(data.sizes[0] || 9);
    setSelectedColor(data.colors[0] || { name: 'Default', hex: '#000000' });
    
    // Feed colors into the 3D model customizer
    setBodyColor(data.colors[0]?.hex || '#0a0a0a');
    setSoleColor(data.colors[1]?.hex || '#00f0ff');
    setSwooshColor(data.colors[2]?.hex || '#ff5500');
    setLacesColor('#ffffff');
  };

  const fetchRelated = async (category) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products?category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        setRelated(data.filter(p => p._id !== id).slice(0, 3));
      }
    } catch (err) {
      console.warn('Error fetching related products', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Bind current customizer sole/body color to the cart representation item object!
    const customColor = {
      name: `${selectedColor.name} (Customized)`,
      hex: bodyColor // use customized colors
    };
    addToCart(product, quantity, selectedSize, customColor);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to leave a review.');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setReviewSuccess('Review submitted successfully!');
      setReviewComment('');
      // Reload product details to show new review
      const updatedProductRes = await fetch(`http://localhost:5000/api/products/${id}`);
      if (updatedProductRes.ok) {
        const updatedData = await updatedProductRes.json();
        setProduct(updatedData);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-white">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Back to shop link */}
      <div>
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-accent uppercase tracking-wider transition-colors">
          <ArrowLeft size={14} />
          Back to Shop Catalog
        </Link>
      </div>

      {/* Main product customization workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE 3D VIEWER (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="h-[380px] sm:h-[480px] w-full relative group border border-white/5 rounded-3xl glass shadow-2xl flex items-center justify-center">
            
            {/* Canvas overlay callouts */}
            <div className="absolute top-4 left-6 z-10 flex flex-col pointer-events-none">
              <span className="text-white font-black text-xs uppercase tracking-widest">{product.name} 3D View</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Drag 360° • Pinch to Zoom</span>
            </div>

            <div className="absolute bottom-4 right-6 z-10 flex gap-2 items-center pointer-events-none">
              <Maximize2 size={12} className="text-gray-500" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">High Dynamic Shadows</span>
            </div>

            {/* R3F Canvas */}
            <Canvas3D
              bodyColor={bodyColor}
              soleColor={soleColor}
              lacesColor={lacesColor}
              swooshColor={swooshColor}
              autoRotate={autoRotate}
              cameraPreset={cameraPreset}
            />
          </div>

          {/* Interactive Customizer controls panel */}
          <div className="glass p-6 rounded-2xl border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Settings size={14} className="text-accent animate-spin-slow" />
                Customize Material Shader Colors
              </h3>
              <button 
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-all ${
                  autoRotate 
                    ? 'bg-accent/25 border-accent text-accent' 
                    : 'border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
                <span className="text-[10px] font-bold">Spin Mode</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Part selector swatches */}
              <div className="space-y-4">
                {/* 3D Part: Main Body */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">1. Shoe Upper Body Color</label>
                  <div className="flex gap-2">
                    {['#0a0a0a', '#1e293b', '#64748b', '#dc2626', '#10b981', '#ea580c'].map(col => (
                      <button
                        key={col}
                        onClick={() => { setBodyColor(col); setAutoRotate(false); }}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${bodyColor === col ? 'border-accent scale-110' : 'border-white/10 hover:scale-105'}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3D Part: Midsole */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">2. Midsole & Air Bubble Glow</label>
                  <div className="flex gap-2">
                    {['#00f0ff', '#a855f7', '#ff0055', '#ccff00', '#ffffff', '#111111'].map(col => (
                      <button
                        key={col}
                        onClick={() => { setSoleColor(col); setAutoRotate(false); }}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${soleColor === col ? 'border-accent scale-110' : 'border-white/10 hover:scale-105'}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3D Part: Stripe */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">3. Side Branding swoosh</label>
                  <div className="flex gap-2">
                    {['#ff5500', '#ffd700', '#00ff66', '#0055ff', '#ff007f', '#ffffff'].map(col => (
                      <button
                        key={col}
                        onClick={() => { setSwooshColor(col); setAutoRotate(false); }}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${swooshColor === col ? 'border-accent scale-110' : 'border-white/10 hover:scale-105'}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3D Part: Laces */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">4. Crossing Laces</label>
                  <div className="flex gap-2">
                    {['#ffffff', '#000000', '#f59e0b', '#dc2626', '#3b82f6'].map(col => (
                      <button
                        key={col}
                        onClick={() => { setLacesColor(col); setAutoRotate(false); }}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${lacesColor === col ? 'border-accent scale-110' : 'border-white/10 hover:scale-105'}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* View Presets Panel */}
              <div className="flex flex-col justify-between border-l border-white/5 pl-0 sm:pl-6 space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Inspect Angles</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['side', 'top', 'front', 'back'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => { setCameraPreset(preset); setAutoRotate(false); }}
                        className={`py-2 rounded-lg text-xs font-black uppercase tracking-widest border transition-all ${
                          cameraPreset === preset 
                            ? 'bg-accent text-black border-accent shadow-md shadow-accent/15' 
                            : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {preset} Preset
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                  *Colors selected in the customized shader panel are bound dynamically to the cart representation item, saving your custom config!
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METADATA & PURCHASE FORM (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Main Info */}
          <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div>
              <span className="text-[10px] text-accent font-black tracking-widest uppercase">{product.category}</span>
              <h1 className="text-3xl font-black uppercase tracking-wider text-white mt-1">{product.name}</h1>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  <Star size={14} className="fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-white">{product.rating}</span>
                <span className="text-xs text-gray-500 font-medium">({product.numReviews} Reviews)</span>
              </div>
            </div>

            <div className="text-2xl font-black text-white">
              ${product.price}
            </div>

            <p className="text-gray-400 text-xs leading-relaxed border-t border-white/5 pt-3">
              {product.description}
            </p>
          </div>

          {/* Configuration Selection */}
          <div className="glass p-6 rounded-2xl border-white/5 space-y-6">
            
            {/* Swatch color details */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Select Base Edition: <strong className="text-white">{selectedColor?.name}</strong>
              </label>
              <div className="flex gap-2">
                {product.colors.map(col => (
                  <button
                    key={col.name}
                    onClick={() => {
                      setSelectedColor(col);
                      // Apply default swatch colors to R3F model on switch
                      setBodyColor(col.hex);
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor?.name === col.name ? 'border-accent scale-110' : 'border-white/10'}`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes selector */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Select Size: <strong className="text-white">{selectedSize} US</strong>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                      selectedSize === sz
                        ? 'bg-accent text-black border-accent'
                        : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity control & Add to cart button */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/10 rounded-full bg-black/40 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="py-2.5 px-4 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="py-2.5 px-4 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Stock notice badge */}
                <span className={`text-[10px] font-bold uppercase ${product.stock > 5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {product.stock === 0 ? 'Out of stock' : `${product.stock} units available`}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3.5 rounded-full font-black uppercase text-xs tracking-widest transition-all ${
                    product.stock === 0
                      ? 'bg-red-950/20 text-red-500 border border-red-500/20 cursor-not-allowed'
                      : 'bg-accent text-black hover:bg-accent/80 hover:shadow-lg hover:shadow-accent/15'
                  }`}
                >
                  <ShoppingBag size={14} className="inline mr-2 -mt-0.5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add custom config'}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-3.5 rounded-full glass hover:bg-white/5 border-white/10 text-gray-400 hover:text-red-400 transition-all"
                >
                  <Heart size={16} className={isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''} />
                </button>
              </div>
            </div>

          </div>

          {/* Specifications Accordion panel */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="glass p-5 rounded-2xl border-white/5 space-y-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Info size={13} className="text-accent" />
                Technical Specifications
              </span>
              
              <div className="grid grid-cols-1 gap-2 text-xs pt-1">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400 font-medium">{key}</span>
                    <span className="text-white font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* REVIEWS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10 border-t border-white/5">
        
        {/* Submit Review (5 columns) */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border-white/5 space-y-4 h-fit">
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <MessageSquare size={14} className="text-accent" />
            Submit Customer Review
          </h3>
          <div className="w-8 h-[2px] bg-accent" />

          {token ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              {reviewSuccess && (
                <div className="p-3 bg-emerald-950/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-semibold">
                  {reviewSuccess}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Star Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="5">5 Stars - Elite Quality</option>
                  <option value="4">4 Stars - Very Comfortable</option>
                  <option value="3">3 Stars - Decent Performance</option>
                  <option value="2">2 Stars - Minor Comfort Issues</option>
                  <option value="1">1 Star - Low Build Quality</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Comment / Feedback</label>
                <textarea
                  rows="4"
                  placeholder="Share details of your experience customizing or wearing these shoes..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-white hover:bg-accent hover:shadow-md hover:shadow-accent/10 text-black font-black uppercase text-xs tracking-widest transition-all"
              >
                Submit Feedback
              </button>
            </form>
          ) : (
            <div className="text-center py-6 text-gray-500 text-xs space-y-3">
              <p>You must be signed in to submit reviews for custom sneakers.</p>
              <Link
                href={`/login?redirect=product/${id}`}
                className="inline-block py-2 px-6 rounded-full border border-white/10 hover:border-accent hover:text-accent font-bold uppercase tracking-wider text-[10px] transition-all"
              >
                Sign In Now
              </Link>
            </div>
          )}
        </div>

        {/* Reviews Lists (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Customer Reviews ({product.reviews.length})
          </h3>
          <div className="w-8 h-[2px] bg-accent -mt-4" />

          <div className="space-y-4 pt-2">
            {product.reviews.length === 0 ? (
              <div className="glass p-8 rounded-2xl border-white/5 text-center text-xs text-gray-500">
                Be the first to review the custom-configured {product.name}! Leave a review to share your feedback.
              </div>
            ) : (
              product.reviews.map((r, index) => (
                <div key={index} className="glass p-4 rounded-xl border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-white">{r.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {new Date(r.createdAt || '').toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    {r.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RECOMMENDED / RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="pt-10 border-t border-white/5 space-y-8">
          <div className="space-y-1">
            <span className="text-[10px] text-accent font-black tracking-widest uppercase">Explore More</span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Recommended Pairs</h2>
            <div className="w-8 h-[2px] bg-accent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <div key={p._id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
