import { useEffect, useState } from "react";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "Our Story" },
  { href: "#products", label: "Products" },
  { href: "#workers", label: "Artisans" },
  { href: "#distributor", label: "Distribute" },
  { href: "#contact", label: "Contact" },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        "border-b border-gold/20 backdrop-blur-md",
        scrolled
          ? "h-14 bg-forest/95"
          : "h-[70px] bg-forest/85"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[50%_15%_50%_15%] bg-gradient-gold font-display text-lg font-bold text-forest shadow-gold">
            H
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-display text-amber">
              HIMSARU
            </div>
            <div className="text-[0.55rem] uppercase tracking-[0.25em] text-cream/60">
              Pure Pahadi
            </div>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {isHomePage && links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-cream/85 transition-colors hover:text-amber"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-amber transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          {!user ? (
            <li>
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-amber transition-all hover:bg-gold/20"
              >
                <UserIcon size={14} /> Sign In
              </Link>
            </li>
          ) : (
            <>
              {user.role === 'ADMIN' && (
                <li>
                  <Link
                    to="/admin"
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-amber hover:text-gold"
                  >
                    Admin Panel
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-red-400 transition-all hover:bg-red-500/20"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </li>
            </>
          )}
        </ul>

        <button
          className="rounded-md p-2 text-amber md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-gold/20 bg-forest/98 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-1 p-4">
            {isHomePage && links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-cream/85 hover:bg-white/5 hover:text-amber"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="mt-4 border-t border-cream/10 pt-4">
              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-gold/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.15em] text-amber"
                >
                  <UserIcon size={16} /> Sign In
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-amber hover:bg-white/5"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.15em] text-red-400"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
