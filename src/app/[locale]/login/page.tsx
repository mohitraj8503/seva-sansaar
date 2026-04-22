"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

// --- THE VAULT (Strict & Simple) ---
const PRIVATE_VAULT = [
  {
    username: "mohitraj8503",
    email: "mohitraj8503@gmail.com",
    password: "thistooshallpass",
  },
  {
    username: "rishika@me",
    email: "rishika@me.com",
    password: "thistooshallpass",
  }
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [inputUser, setInputUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const normalizedUser = inputUser.trim().toLowerCase();
    
    // Check the Vault
    const match = PRIVATE_VAULT.find(u => 
      (u.username === normalizedUser || u.email === normalizedUser) && 
      u.password === password
    );

    if (match) {
      try {
        // Authenticate with Supabase Auth
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: match.email,
          password: match.password,
        });

        if (authError) throw authError;

        // SUCCESS: Set Private Session
        localStorage.setItem("lovelink_session_v2", JSON.stringify({
          email: match.email,
          username: match.username,
          authenticated: true,
          timestamp: Date.now()
        }));
        
        // Instant Redirect
        router.replace("/en/connectia");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Auth failed. Ensure user exists in Supabase Auth.";
        setError(message);
        setIsSubmitting(false);
      }
    } else {
      setError("Invalid credentials. Please check your username and password.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-6 selection:bg-[#7340FF]/30">
      <div id="seva-hero-top-sentinel" className="absolute top-0 w-full h-px opacity-0 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 z-0">
        <Image src="/login-bg.png" alt="India Heritage" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[#0a1428]/50 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="group mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 transition hover:text-white/90">
             <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
             Return Home
          </Link>
          <div className="relative h-24 w-[280px]">
            <Image src="/logo-horizontal.png" alt="Seva Sansaar" fill className="object-contain brightness-0 invert" priority />
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-700 hover:border-white/20">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-light text-white tracking-tight">नमस्ते</h1>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">LoveLink Private Portal</p>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="group relative border-b border-white/10 py-2 focus-within:border-[#7340FF]">
              <input
                type="text"
                value={inputUser}
                onChange={(e) => setInputUser(e.target.value)}
                placeholder="Username"
                className="w-full bg-transparent py-2 text-sm font-medium text-white placeholder:text-white/20 outline-none"
                required
              />
            </div>

            <div className="group relative border-b border-white/10 py-2 focus-within:border-[#7340FF]">
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="flex-1 bg-transparent py-2 text-sm font-medium text-white placeholder:text-white/20 outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-white/20 hover:text-[#7340FF]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="text-center text-[10px] font-bold uppercase tracking-wider text-rose-400">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-white text-[11px] font-black uppercase tracking-[0.3em] text-[#1a2d5c] shadow-xl transition-all hover:scale-[1.02] hover:bg-[#7340FF] hover:text-white disabled:opacity-50"
            >
              {isSubmitting ? "Opening Vault..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
