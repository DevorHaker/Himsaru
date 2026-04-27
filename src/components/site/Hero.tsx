import heroImg from "@/assets/hero-himalayas.jpg";
import { ArrowRight, Leaf } from "lucide-react";

const stats = [
  { num: "100%", label: "Natural" },
  { num: "50+", label: "Pahadi Women" },
  { num: "8+", label: "Pure Products" },
  { num: "1000+", label: "Happy Homes" },
];

const miniProducts = [
  { icon: "🧈", name: "A2 Badri Ghee" },
  { icon: "🍯", name: "Wild Honey" },
  { icon: "🧂", name: "Pisyu Loon" },
  { icon: "🫘", name: "Pahadi Rajma" },
  { icon: "🌶", name: "Haldi & Mirch" },
  { icon: "🥣", name: "Mountain Dals" },
];

export const Hero = () => {
  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      {/* Background image */}
      <img
        src={heroImg}
        alt="Snow-capped Himalayan peaks at golden hour with cedar forest"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Forest gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/70 to-forest/95" />
      {/* Twinkling stars */}
      <div
        className="absolute inset-x-0 top-0 h-[55%] animate-twinkle opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--cream) / 0.7) 1px, transparent 1px), radial-gradient(circle, hsl(var(--cream) / 0.4) 1px, transparent 1px)",
          backgroundSize: "180px 180px, 110px 110px",
          backgroundPosition: "0 0, 60px 80px",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-32 text-center">
        <span className="mb-6 inline-flex animate-fade-down items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-amber">
          <Leaf size={12} /> Pahad Ki Pavitrata
        </span>

        <h1 className="animate-fade-up font-display text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-display text-cream">
          HIM<span className="text-gradient-gold">SARU</span>
        </h1>

        <p
          className="mt-3 animate-fade-up font-serif italic text-[clamp(1.1rem,2.5vw,1.7rem)] tracking-[0.1em] text-cream/75"
          style={{ animationDelay: "0.2s" }}
        >
          Pure Taste of the Himalayas
        </p>

        <p
          className="mx-auto mt-8 max-w-2xl animate-fade-up text-base leading-relaxed text-cream/70"
          style={{ animationDelay: "0.4s" }}
        >
          From the sacred valleys of Uttarakhand to your kitchen — authentic
          Pahadi foods crafted by the mountain women who have kept these
          traditions alive for generations.
        </p>

        <div
          className="mt-10 flex animate-fade-up flex-wrap justify-center gap-4"
          style={{ animationDelay: "0.6s" }}
        >
          <a
            href="#products"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-forest shadow-gold transition-all hover:-translate-y-1 hover:shadow-elevated"
          >
            Explore Treasures
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#about"
            className="rounded-full border border-cream/40 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all hover:-translate-y-1 hover:border-amber hover:text-amber"
          >
            Our Story
          </a>
        </div>

        <div
          className="mt-16 grid w-full max-w-3xl animate-fade-up grid-cols-2 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/5 backdrop-blur-sm sm:grid-cols-4"
          style={{ animationDelay: "0.9s" }}
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-forest/30 px-4 py-5 text-center">
              <div className="font-display text-2xl font-bold text-amber">
                {s.num}
              </div>
              <div className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-cream/55">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product strip */}
      <div className="relative z-10 border-t border-cream/10 bg-forest/40 px-6 py-6 backdrop-blur-md">
        <h2 className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-cream/55">
          ✦ Our Himalayan Treasures ✦
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {miniProducts.map((p) => (
            <a
              key={p.name}
              href="#products"
              className="flex items-center gap-2 rounded-xl border border-cream/10 bg-cream/5 px-4 py-2.5 text-sm text-cream/80 transition-all hover:border-amber hover:bg-gold/15"
            >
              <span className="text-lg" aria-hidden>{p.icon}</span>
              <span className="text-xs font-semibold">{p.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
