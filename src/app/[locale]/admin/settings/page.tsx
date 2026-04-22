"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { Database, KeyRound, Mail, Shield, BookOpen } from "lucide-react";

export default function AdminSettingsPage() {
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-3xl space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-[#1a1f2e]">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Environment and security notes for this admin deployment. Values marked “server” are only
          available in API routes.
        </p>
      </div>

      <ul className="space-y-4">
        <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f4f9] text-[#1a1f2e]">
              <Shield size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-[#1a1f2e]">Admin access</h3>
              <p className="mt-1 text-sm text-gray-600">
                API routes check the Firebase ID token and <code className="rounded bg-gray-100 px-1 text-xs">ADMIN_EMAILS</code>{" "}
                (comma-separated) on the server. In development, if <code className="rounded bg-gray-100 px-1 text-xs">ADMIN_EMAILS</code>{" "}
                is empty, APIs may allow access — set it before production.
              </p>
              <p className="mt-2 text-xs text-amber-800">
                Client bundle cannot read ADMIN_EMAILS; configure it in <code className="rounded bg-gray-100 px-1">.env.local</code>.
              </p>
            </div>
          </div>
        </li>

        <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f4f9] text-[#1a1f2e]">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="font-black text-[#1a1f2e]">Session</h3>
              <p className="mt-1 text-sm text-gray-600">
                Middleware checks the <code className="rounded bg-gray-100 px-1 text-xs">__session</code> cookie set after login.
                Admin API calls must send <code className="rounded bg-gray-100 px-1 text-xs">Authorization: Bearer &lt;idToken&gt;</code>.
              </p>
            </div>
          </div>
        </li>

        <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f4f9] text-[#1a1f2e]">
              <Database size={22} />
            </div>
            <div>
              <h3 className="font-black text-[#1a1f2e]">Firestore</h3>
              <p className="mt-1 text-sm text-gray-600">
                Dashboard stats, bookings, reviews, and businesses use the Firebase Admin SDK. If
                credentials are missing, APIs return empty data or a note.
              </p>
            </div>
          </div>
        </li>

        <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f4f9] text-[#1a1f2e]">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="font-black text-[#1a1f2e]">Public registration</h3>
              <p className="mt-1 text-sm text-gray-600">
                New provider listings use the public flow. Approve or reject from{" "}
                <Link href={`/${locale}/admin/businesses`} className="font-bold text-blue-600 hover:underline">
                  Businesses
                </Link>
                .
              </p>
            </div>
          </div>
        </li>

        <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f4f9] text-[#1a1f2e]">
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="font-black text-[#1a1f2e]">Documentation</h3>
              <p className="mt-1 text-sm text-gray-600">
                See repository README and OpenAPI specs for API contracts and environment variables.
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
