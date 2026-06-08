'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 4; // Fast, elegant load simulation
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center">
      {/* Dynamic ambient background glows */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl top-1/4 left-1/4 animate-pulse pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-3xl bottom-1/4 right-1/4 animate-pulse pointer-events-none" />

      {/* Main loading element */}
      <div className="relative flex flex-col items-center">
        
        {/* Glow spinner ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/5" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-accent"
          />
          
          {/* Logo mockup inside loader */}
          <span className="text-xs font-black tracking-widest text-white uppercase animate-pulse">
            S / V
          </span>
        </div>

        {/* Sneaker silhouette loader text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8 space-y-2"
        >
          <h2 className="text-sm font-black tracking-[0.3em] text-white uppercase bg-gradient-to-r from-white via-gray-300 to-accent bg-clip-text text-transparent">
            SNEAKVERSE
          </h2>
          
          {/* Loading status bar */}
          <div className="w-40 h-[2px] bg-white/10 rounded-full mx-auto overflow-hidden relative">
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">
            Step into the future ({progress}%)
          </p>
        </motion.div>

      </div>
    </div>
  );
}
