'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();

  const [activeColor, setActiveColor] = useState(product.colors[0] || { name: 'Default', hex: '#000000' });
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // Tilt event tracking
  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - card.left) / card.width - 0.5; // -0.5 to 0.5 range
    const y = (e.clientY - card.top) / card.height - 0.5;  // -0.5 to 0.5 range
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Default size selection is the first available size (e.g. 9 or size[0])
    const defaultSize = product.sizes[0] || 9;
    addToCart(product, 1, defaultSize, activeColor);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="tilt-card cursor-pointer group flex flex-col h-full bg-[#0a0a0d] border border-white/5 hover:border-accent/30 rounded-2xl p-4 transition-all duration-300 relative overflow-hidden"
      style={{
        transform: isHovered
          ? `rotateY(${coords.x * 15}deg) rotateX(${-coords.y * 15}deg) scale3d(1.02, 1.02, 1.02)`
          : 'rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0, 240, 255, 0.08)'
          : '0 4px 20px rgba(0, 0, 0, 0.2)',
        transition: isHovered ? 'transform 0.05s ease, border-color 0.3s ease' : 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
      }}
    >
      {/* Background neon glow highlight */}
      <div
        className="absolute w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-all duration-500 top-4 right-4 pointer-events-none"
        style={{ backgroundColor: activeColor.hex }}
      />

      {/* Header bar (Brand & Wishlist) */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
          {product.brand}
        </span>
        <button
          onClick={handleWishlistClick}
          className="p-1.5 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-red-400 hover:bg-white/10 transition-all z-10"
        >
          <Heart size={14} className={isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      {/* Interactive 3D Product visual display wrapper */}
      <Link href={`/product/${product._id}`} className="flex-1 flex flex-col justify-between">

        {/* Sneaker dynamic display visual */}
        <div className="h-44 w-full flex flex-col items-center justify-center relative my-2">
          {/* A procedural radial halo highlighting the active variation */}
          <div
            className="w-24 h-24 rounded-full opacity-10 filter blur-xl absolute transition-all duration-300"
            style={{ backgroundColor: activeColor.hex }}
          />

          {/* Procedural sneaker shape */}
          <div className="w-32 h-14 bg-gradient-to-r from-gray-700 to-gray-800 rounded-tr-[40px] rounded-bl-[15px] relative shadow-lg transform -rotate-12 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500">
            {/* Sole block */}
            <div
              className="absolute -bottom-2 -left-1 -right-1 h-3 rounded-b-[8px] transition-all duration-300 border-t border-white/10"
              style={{ backgroundColor: activeColor.hex }}
            />
            {/* Laces block decoration */}
            <div className="absolute top-1 left-8 w-8 h-2 border-t-2 border-dashed border-white/40 transform rotate-12" />
            {/* Accent stripe representing customizable options */}
            <div className="absolute top-4 left-4 right-4 h-3 bg-black/40 rounded-full" />
          </div>

          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] absolute bottom-2">
            Dynamic Customizer Enabled
          </span>
        </div>

        {/* Sneaker name & rating */}
        <div className="mt-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wide group-hover:text-accent transition-colors truncate">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-400">
              <Star size={11} className="fill-amber-400" />
            </div>
            <span className="text-[10px] font-bold text-white">{product.rating}</span>
            <span className="text-[9px] text-gray-500 font-medium">({product.numReviews} Reviews)</span>
          </div>
        </div>

        {/* Pricing, Available colors, and Actions */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-3">

          {/* Price & Colors selector */}
          <div className="flex justify-between items-center">
            <span className="text-base font-black text-white">${product.price}</span>

            {/* Color swatches */}
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((c) => (
                <button
                  key={c.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveColor(c);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${activeColor.name === c.name
                    ? 'border-accent scale-125'
                    : 'border-white/10 hover:scale-110'
                    }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Action trigger row */}
          <div className="flex gap-2 z-10">
            <div
              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-center text-white uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Eye size={12} />
              <span>Details</span>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${product.stock === 0
                ? 'bg-red-950/20 text-red-500 border border-red-500/20 cursor-not-allowed'
                : 'bg-accent text-black hover:bg-accent/80 hover:shadow-md hover:shadow-accent/10'
                }`}
            >
              <ShoppingCart size={11} />
              <span>{product.stock === 0 ? 'Out Stock' : 'Add'}</span>
            </button>
          </div>

        </div>
      </Link>
    </div>
  );
}
