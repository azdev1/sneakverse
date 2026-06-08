'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Loader from '../../components/Loader';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { register, user, error, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push(redirect ? `/${redirect}` : '/profile');
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      router.push(redirect ? `/${redirect}` : '/profile');
    }
  };

  return (
    <>
      {loading && <Loader />}

      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-radial from-gray-900/10 to-[#030303]">
        
        {/* Glow ambient accent */}
        <div className="absolute w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 glass p-8 rounded-3xl border-white/5 relative z-10">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-[10px] text-accent font-black tracking-widest uppercase">SneakVerse Auth</span>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Create Account</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Unlock custom configurations saving</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message */}
            {((submitted && error) || localError) && (
              <div className="p-3 bg-red-950/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-semibold">
                {localError || error}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
                <User size={14} className="absolute left-4 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
                <Mail size={14} className="absolute left-4 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
                <Lock size={14} className="absolute left-4 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
                <Lock size={14} className="absolute left-4 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Register button */}
            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-accent hover:shadow-lg hover:shadow-accent/15 transition-all duration-300 flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Initialize Portfolio</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Redirect to login */}
          <div className="text-center pt-2 text-xs border-t border-white/5">
            <span className="text-gray-500">Already have a design workspace?</span>{' '}
            <Link href={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-accent hover:underline font-bold">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<Loader />}>
      <RegisterContent />
    </Suspense>
  );
}
