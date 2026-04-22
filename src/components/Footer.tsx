"use client";

import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { CONTACT, SOCIAL_LINKS, APP_STORE_LINKS } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations("Footer");
  const pathname = usePathname();

  if (pathname.includes("/login") || pathname.includes("/admin") || pathname.includes("/connectia")) return null;

  return (
    <footer className="bg-navy text-white/80">
      <div className="section-minimal-inner py-16 md:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <div className="relative h-16 w-full max-w-[220px] sm:h-18 sm:max-w-[250px]">
              <Image
                src="/logo-horizontal.png"
                alt="Seva Sansaar"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 220px, 250px"
              />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
              {t("desc")}
            </p>
            <p className="mt-4 inline-block rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90">
              {t("initiative")}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">{t("quickLinks")}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="transition hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-white">
                  Business Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">{t("contact")}</p>
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-saffron" aria-hidden />
                <a href={`tel:${CONTACT.phone}`} className="transition hover:text-white">
                  +91 {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-saffron" aria-hidden />
                <a href={`mailto:${CONTACT.email}`} className="transition hover:text-white">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-saffron" aria-hidden />
                <a href={`https://wa.me/${CONTACT.whatsapp}`} className="transition hover:text-white">
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">{t("stayConnected")}</p>
            <div className="mt-6 space-y-3">
              {APP_STORE_LINKS.ios !== "#" && (
                <a
                  href={APP_STORE_LINKS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  aria-label="Download on App Store"
                >
                  <div className="h-6 w-6">
                    <svg viewBox="30 336.7 449.7 449.7" fill="currentColor" aria-hidden><path d="M480.3 480.3c0-1.6-.1-3.1-.2-4.7V471c0-1.6-.1-3.1-.2-4.7l-94.6-94.6c-4.1-4.1-10.8-4.1-14.9 0L256 486.2l-114.4-114.4c-4.1-4.1-10.8-4.1-14.9 0l-94.6 94.6c-.1 1.6-.2 3.1-.2 4.7v4.7c0 1.6.1 3.1.2 4.7l94.6 94.6c4.1 4.1 10.8 4.1 14.9 0L256 474.2l114.4 114.4c4.1 4.1 10.8 4.1 14.9 0l94.6-94.6c.1-1.6.2-3.1.2-4.7V480.3z"/></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase leading-none opacity-50">Download on</p>
                    <p className="text-sm font-bold">App Store</p>
                  </div>
                </a>
              )}
              {APP_STORE_LINKS.android !== "#" && (
                <a
                  href={APP_STORE_LINKS.android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  aria-label="Get it on Play Store"
                >
                  <div className="h-6 w-6">
                    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l236.6-236.6L47 0zm394.8 231.1L316.5 158.1l-60.1 60.1 60.1 60.1 125.3-72.9c13.1-7.7 21-20.4 21-34.3s-7.9-26.6-21-34.3zM104.6 499l220.7-127.3-60.1-60.1L47 512c13.1-6.8 21.7-19.2 21.7-35.3v-4.7L104.6 499z"/></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase leading-none opacity-50">Get it on</p>
                    <p className="text-sm font-bold">Play Store</p>
                  </div>
                </a>
              )}
            </div>
            <div className="mt-8 flex gap-4" aria-label="Social media links">
              {SOCIAL_LINKS.instagram !== "#" && (
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 p-3 transition hover:bg-white/10"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              )}
              {SOCIAL_LINKS.linkedin !== "#" && (
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 p-3 transition hover:bg-white/10"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              )}
              {SOCIAL_LINKS.twitter !== "#" && (
                <a
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 p-3 transition hover:bg-white/10"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>&copy; {year} {t("copyright")}</p>
            <p className="mt-2 text-xs opacity-80">{t("madeWith")} <span className="font-bold text-white uppercase tracking-widest">Mohit Raj</span></p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 font-semibold">
            <Link href="/privacy" className="transition hover:text-white">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              {t("terms")}
            </Link>
            <Link href="/grievance" className="transition hover:text-white">
              {t("grievance")}
            </Link>
          </div>
        </div>
      </div>
      <div className="tricolor-stripe h-1 w-full" aria-hidden />
    </footer>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
  );
}
