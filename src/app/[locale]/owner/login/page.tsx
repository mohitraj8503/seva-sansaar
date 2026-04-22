"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Store } from "lucide-react";
import { writeOwnerSession } from "@/lib/ownerClient";
import { safeOwnerPostLoginRedirect } from "@/lib/safeRedirect";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/auth/owner/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(data.error ?? "Login failed.");
      return;
    }
    const data = (await res.json()) as {
      businessId: string;
      ownerSecret: string;
      name?: string;
    };
    writeOwnerSession({
      businessId: data.businessId,
      ownerSecret: data.ownerSecret,
      email: email.trim().toLowerCase(),
      name: data.name,
    });
    const q =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const redir = safeOwnerPostLoginRedirect(q?.get("redirect") ?? null);
    router.replace(redir);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4f7fb] via-white to-[#eef3ff] px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1a2d5c]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1a2d5c]">
          <Store size={14} />
          Business owner
        </div>
        <h1 className="text-2xl font-black text-gray-900">Sign in</h1>
        <p className="mt-2 text-sm text-gray-600">Use the email and password you chose when listing your business.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 py-2 pl-10 pr-10 text-sm"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label="Toggle password"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {err && <p className="text-sm text-red-700">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-[#1a2d5c] text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New business?{" "}
          <Link href="/list-business" className="font-bold text-[#1a2d5c] hover:underline">
            Register your listing
          </Link>
        </p>
        <Link href="/" className="mt-4 block text-center text-sm text-gray-500 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
