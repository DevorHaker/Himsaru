import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "Our Story" },
  { href: "#products", label: "Products" },
  { href: "#workers", label: "Artisans" },
  { href: "#distributor", label: "Distribute" },
  { href: "#contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
        <a href="#home" className="flex items-center gap-3">
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
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-xs font-semibold uppercase tracking-[0.15em] text-cream/85 transition-colors hover:text-amber"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-amber transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <a
              href="#distributor"
              className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-forest shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Order Now
            </a>
          </li>
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
            {links.map((l) => (
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
          </ul>
        </div>
      )}
    </nav>
  );
};
