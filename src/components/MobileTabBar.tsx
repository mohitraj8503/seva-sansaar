"use client";

import { useState } from "react";
import { CalendarDays, ChevronRight, Home, Menu, Search, User, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/login", label: "Profile", icon: User },
] as const;

const MENU_LINKS = [
  { label: "Explore services", href: "/search" },
  { label: "Join as professional", href: "/list-business" },
  { label: "My dashboard", href: "/dashboard" },
  { label: "My profile", href: "/profile" },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.includes("/login") || pathname.includes("/admin") || pathname.includes("/connectia")) return null;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E7EB] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Primary navigation"
      >
        <div className="mx-auto flex max-w-lg justify-around px-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[64px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-90 ${
                  active ? "text-[#1a2d5c]" : "text-[#6B7280]"
                }`}
              >
                {active && (
                  <div className="absolute top-0 h-1 w-8 rounded-b-full bg-[#FF9933] shadow-lg shadow-[#FF9933]/40 animate-in slide-in-from-top-1 duration-500" />
                )}
                <div className={`p-2 rounded-xl transition-colors duration-300 ${active ? 'bg-[#1a2d5c]/5' : ''}`}>
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} className="shrink-0" aria-hidden />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-tight transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-label="Open menu"
            className="relative flex min-h-[64px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 text-[#6B7280] transition-all duration-300 active:scale-90"
          >
            <div className="p-2 rounded-xl">
              <Menu size={22} className="shrink-0" aria-hidden />
            </div>
            <span className="text-[11px] font-black uppercase tracking-tight opacity-60">
              Menu
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <style>{`
              @keyframes seva-drawer-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
              .seva-drawer-panel { animation: seva-drawer-up 0.25s ease-out; }
            `}</style>
            <div className="seva-drawer-panel">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close"
                  className="rounded-full bg-gray-100 p-2 text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
              <ul>
                {MENU_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-[#1a2d5c] transition hover:bg-gray-100"
                    >
                      {link.label}
                      <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
