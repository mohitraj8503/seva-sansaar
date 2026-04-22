"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Settings,
  Bell,
  ClipboardList,
  BarChart3,
  Search,
  LogOut,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: ClipboardList },
  { name: "Businesses", href: "/admin/businesses", icon: Store },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "next-intl";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { user, loading, signOut } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    // Check for session cookie (for hardcoded admin login)
    const hasSessionCookie = document.cookie.includes('__session=');
    
    if (!user && !hasSessionCookie) {
      const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/${locale}/login${redirect}`);
      setIsAuthorized(false);
      return;
    }

    // Allow access if either Firebase user exists or session cookie exists
    setIsAuthorized(true);
  }, [user, loading, pathname, router, locale]);

  const handleSignOut = async () => {
    // Clear session cookie
    document.cookie = '__session=; path=/; max-age=0; SameSite=Lax';
    
    // If Firebase user exists, sign out
    if (user) {
      await signOut();
    }
    
    router.replace(`/${locale}/login`);
  };

  if (loading || isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f4f9]">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-medium text-gray-600 shadow-sm">
          Verifying secure access...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1f4f9]">
      {/* Sidebar - EXACT TechTomorrow Style */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1f2e] text-white">
        <div className="flex h-24 flex-col justify-center px-8">
          <h1 className="text-xl font-black tracking-tight text-white uppercase flex flex-col">
            Seva Sansaar
            <span className="text-[10px] font-bold text-[#ffca28] tracking-[0.2em] mt-1">ADMIN PANEL</span>
          </h1>
        </div>
        
        <div className="mt-4 px-4 space-y-1">
          <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">SECTOR_MAP</p>
          {navigation.map((item) => {
            const href = `/${locale}${item.href}`;
            const pathWithoutLocale = pathname.replace(/^\/[^/]+/, "") || "/";
            const isActive = pathWithoutLocale === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={href}
                className={`group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? "bg-[#ffca28] text-[#1a1f2e] scale-105 -translate-x-1 shadow-xl shadow-[#ffca28]/30" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white hover:scale-105 hover:-translate-x-1"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:rotate-6" />
                  {item.name}
                </div>
                {isActive && <div className="h-4 w-1 bg-[#1a1f2e] rounded-full opacity-30" />}
              </Link>
            );
          })}
        </div>

        {/* User Bio Bottom Sidebar */}
        <div className="absolute bottom-8 w-full px-4">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-black text-[#ffca28]">
                {(user?.email?.charAt(0) ?? user?.displayName?.charAt(0) ?? "A").toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-black text-white">
                  {user?.displayName?.trim() || "Administrator"}
                </p>
                <p className="truncate text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {user?.email ?? "Super Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 flex items-center gap-2 text-[10px] font-black text-gray-400 transition-all duration-300 hover:text-white hover:scale-105 hover:translate-x-1 uppercase tracking-widest active:scale-95"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Header - EXACT TechTomorrow Style */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-[#f1f4f9] px-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
             <span>ADMIN CONSOLE</span>
             <ChevronRight size={12} className="text-gray-300" />
             <span className="text-gray-900 capitalize">{pathname.split("/").pop() || "Dashboard"}</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative hidden w-64 md:block">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full rounded-2xl bg-white/80 border border-transparent px-4 py-2 text-xs font-bold transition-all focus:bg-white focus:border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200/50"
              />
            </div>

            {/* Notifications and Profile */}
            <div className="flex items-center gap-2">
              <button className="relative rounded-2xl bg-white p-3 text-gray-400 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md hover:text-gray-600 active:scale-95">
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-[#ffca28]"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-12 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
