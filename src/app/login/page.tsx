'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { Mail, Lock, School, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setIsNative(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success('Login berhasil!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      toast.error('Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 md:pt-4 relative overflow-hidden">
      {/* Back Button (Only show on Web) */}
      {!isNative && (
        <Link href="/" className="absolute top-6 left-6 md:top-8 md:left-10 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm backdrop-blur-md">
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      )}

      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neon-purple/20 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 relative z-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-neon-blue/20">
              <School size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">E-Komite</h1>
            <p className="text-text-secondary text-sm">
              Sistem Perbendaharaan Madrasah Aliyah
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              placeholder="Email Admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Button 
              type="submit" 
              className="w-full mt-6" 
              isLoading={isLoading}
            >
              Masuk
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-text-tertiary">
              &copy; {new Date().getFullYear()} Madrasah Aliyah. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
