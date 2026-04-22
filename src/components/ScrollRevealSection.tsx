"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * Fade-in when this block enters the viewport. Descendants with `.reveal-on-scroll` get `.reveal-on-scroll-visible`.
 */
export default function ScrollRevealSection({ children, className = "", id }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Safety fallback: reveal after 500ms even if observer fails (common on mobile)
    const fallback = setTimeout(() => {
      el.querySelectorAll(".reveal-on-scroll").forEach((node) => {
        node.classList.add("reveal-on-scroll-visible");
      });
    }, 500);

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        clearTimeout(fallback);
        el.querySelectorAll(".reveal-on-scroll").forEach((node) => {
          node.classList.add("reveal-on-scroll-visible");
        });
        io.disconnect();
      },
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" }
    );

    io.observe(el);
    return () => {
      clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
}
