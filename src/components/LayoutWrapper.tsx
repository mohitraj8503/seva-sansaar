"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConnectia = pathname.includes('/connectia');

  if (isConnectia) {
    return <main className="h-[100dvh] w-full overflow-hidden bg-black">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 pb-24 md:pb-0" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
