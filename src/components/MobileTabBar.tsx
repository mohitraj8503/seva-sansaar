"use client";

import { CalendarDays, Home, Search, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/login", label: "Profile", icon: User },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();

  if (pathname.includes("/login") || pathname.includes("/admin") || pathname.includes("/connectia")) return null;

  return (
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
      </div>
    </nav>
  );
}
