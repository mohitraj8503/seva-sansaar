"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { sessionManager } from "@/lib/sessionManager";
import { chatLock } from "@/lib/chatLock";

// --- THE VAULT (Hardcoded for Undercover Mode) ---
const ALLOWED = [
  { username: 'mohitraj8503', password: 'thistooshallpass', email: 'mohitraj8503@gmail.com' },
  { username: 'rishika@me', password: 'thistooshallpass', email: 'rishika@me.com' }
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [inputUser, setInputUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    // If session is still valid, skip login entirely — instant access
    if (sessionManager.isSessionValid()) {
      setIsSessionValid(true);
      const userId = sessionManager.getUserId();
      if (userId && !chatLock.isLocked(userId)) {
        router.replace('/connectia?setup_pin=true');
      } else {
        router.replace('/connectia');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // If valid session exists — instant access, no credentials needed
    if (sessionManager.isSessionValid()) {
      router.push('/connectia');
      return;
    }

    const username = inputUser.trim();
    
    // Step 1 — Validate against allowed credentials only
    const match = ALLOWED.find(
      c => (c.username.toLowerCase() === username.toLowerCase() || c.email.toLowerCase() === username.toLowerCase()) && c.password === password
    );

    if (!match) {
      setError('Invalid credentials');
      setIsSubmitting(false);
      return;
    }

    // Step 2 — Sign in with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: match.email,
      password: match.password,
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError.message);
      setError(authError.message === 'Invalid login credentials' ? 'Invalid credentials' : authError.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.user) {
      setError('User not found');
      setIsSubmitting(false);
      return;
    }

    // Step 3 — Create 1-hour session
    sessionManager.createSession(data.user.id);

    // Step 4 — Redirect to chat (Force PIN setup if not exists)
    if (!chatLock.isLocked(data.user.id)) {
      router.replace('/connectia?setup_pin=true');
    } else {
      router.replace('/connectia');
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-6 selection:bg-[#7340FF]/30">
      <div id="seva-hero-top-sentinel" className="absolute top-0 w-full h-px opacity-0 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 z-0">
        <Image src="/login-bg.png" alt="Portal" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[6px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-3xl transition-all duration-700 hover:border-white/20">
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="relative w-48 h-16 mb-6">
              <Image src="/logo-horizontal.png" alt="Seva Sansaar" fill className="object-contain" priority />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">सेवा संसार</h1>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Seva Sansaar Portal</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin} autoComplete="off">
            {!isSessionValid && (
              <>
                <div className="group relative border-b border-white/10 py-2 focus-within:border-[#7340FF] transition-colors">
                  <input
                    type="text"
                    value={inputUser}
                    onChange={(e) => setInputUser(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-transparent py-3 text-sm font-medium text-white placeholder:text-white/20 outline-none"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                  />
                </div>

                <div className="group relative border-b border-white/10 py-2 focus-within:border-[#7340FF] transition-colors">
                  <div className="flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="flex-1 bg-transparent py-3 text-sm font-medium text-white placeholder:text-white/20 outline-none"
                      required
                      autoComplete="new-password"
                      data-lpignore="true"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-white/20 hover:text-[#7340FF] transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center justify-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                <AlertCircle size={12} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-white text-[11px] font-black uppercase tracking-[0.4em] text-black shadow-xl transition-all hover:bg-[#7340FF] hover:text-white disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? "Authenticating..." : isSessionValid ? "Continue →" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
