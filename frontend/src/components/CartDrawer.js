'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function CartDrawer() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cartItems,
    isOpen,
    closeCart,
    removeFromCart,
    updateQty,
    cartSubtotal,
    shippingPrice,
    taxPrice,
    cartTotal
  } = useCart();

  const handleCheckout = () => {
    closeCart();
    if (!user) {
      router.push('/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0c] border-l border-white/10 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-accent" />
                <h2 className="text-lg font-black tracking-wider uppercase text-white">Your Cart</h2>
                <span className="text-xs bg-accent text-black font-extrabold px-2 py-0.5 rounded-full">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag size={48} className="text-gray-600 animate-bounce" />
                  <div>
                    <h3 className="text-white font-bold text-base">Your cart is empty</h3>
                    <p className="text-gray-400 text-xs mt-1">Select a model from the customized catalog to add it here.</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="glass hover:bg-accent hover:text-black border-accent/20 text-accent text-xs font-bold py-2.5 px-6 rounded-full uppercase tracking-wider transition-all"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.product}-${item.size}-${item.color.name}`}
                    className="glass p-4 rounded-xl flex gap-4 border-white/5 relative hover:border-white/10 transition-all"
                  >
                    {/* Image block (using dynamic fallback representation) */}
                    <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden border border-white/5 relative">
                      {/* Procedural background according to sneaker color */}
                      <div 
                        className="w-12 h-12 rounded-full opacity-40 blur-sm absolute"
                        style={{ backgroundColor: item.color.hex }}
                      />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest z-10 text-center px-1">
                        {item.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Metadata block */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white truncate uppercase tracking-wide">
                          {item.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-gray-400">
                          <span>Size: <strong className="text-white">{item.size}</strong></span>
                          <span className="flex items-center gap-1">
                            Color: 
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
                              style={{ backgroundColor: item.color.hex }}
                              title={item.color.name}
                            />
                            <strong className="text-white">{item.color.name}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Delete wrapper */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-white/10 rounded-full bg-black/40 overflow-hidden">
                          <button
                            onClick={() => updateQty(item.product, item.size, item.color.name, item.qty - 1)}
                            className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-white min-w-[20px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.product, item.size, item.color.name, item.qty + 1)}
                            className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="text-sm font-black text-accent">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Trash remove button */}
                    <button
                      onClick={() => removeFromCart(item.product, item.size, item.color.name)}
                      className="absolute top-4 right-4 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Pricing Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/40 space-y-4">
                <div className="space-y-1.5 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Shipping</span>
                    <span className="text-white">{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax (8%)</span>
                    <span className="text-white">${taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2.5 border-t border-white/5 mt-2">
                    <span>Total Amount</span>
                    <span className="text-accent">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-accent to-purple-600 hover:from-accent hover:to-purple-500 text-black font-black uppercase text-xs tracking-widest rounded-full shadow-lg shadow-accent/15 transition-all duration-300 hover:scale-[1.02]"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
