"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/calendario", label: "Calendario" },
  { href: "/polla", label: "Polla" },
  { href: "/donde-ver", label: "Dónde ver" },
  { href: "/grupos", label: "Grupos" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("my_theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("my_theme", next ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 dark:border-white/10 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-title text-xl font-extrabold tracking-tight">
          Mundial<span className="text-primary">Ya</span>
          <span className="ml-1 text-accent">⚽</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-primary/10 ${
                pathname.startsWith(n.href) ? "text-primary" : "text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            aria-label="Cambiar modo oscuro"
            className="rounded-lg p-2 text-lg hover:bg-primary/10"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 hover:bg-primary/10 md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-black/5 dark:border-white/10 bg-bg px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-primary/10"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
