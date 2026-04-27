import { Linkedin, Instagram, Mail } from "lucide-react";

const founders = [
  {
    initials: "AA",
    name: "Ajay Aryan",
    role: "Co-Founder & CEO",
    bio: "A proud son of Uttarakhand who left a corporate career to build a startup rooted in his mountains. Ajay drives HIMSARU's vision, operations, and community mission.",
  },
  {
    initials: "VK",
    name: "Vishal Kohli",
    role: "Co-Founder & CMO",
    bio: "Born in a small Pahadi village, Vishal brings authentic storytelling and brand-building passion to HIMSARU. He ensures every product carries the true spirit of the mountains.",
  },
];

export const Founders = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-forest py-24">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 20%, hsl(var(--gold) / 0.15), transparent 60%), radial-gradient(ellipse at 80% 80%, hsl(var(--moss) / 0.2), transparent 60%)",
        }}
      />
      <div className="container-narrow relative">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber">
            ★ The Visionaries
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold text-cream">
            The <span className="text-gradient-gold">Co-Founders</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic text-cream/55">
            Two mountain hearts, one shared mission
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
          {founders.map((f) => (
            <article
              key={f.name}
              className="rounded-3xl border border-cream/10 bg-cream/5 p-8 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-gold/40 hover:bg-cream/10"
            >
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-gold font-display text-3xl font-bold text-forest shadow-gold">
                {f.initials}
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-display text-xl font-bold text-cream">
                  {f.name}
                </h3>
                <div className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-amber">
                  {f.role}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-cream/65">
                  {f.bio}
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  {[Linkedin, Instagram, Mail].map((Icon, i) => (
                    <a
                      key={i}
                      href="#contact"
                      aria-label="social link"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 bg-cream/5 text-cream/70 transition-all hover:border-amber hover:bg-gold/15 hover:text-amber"
                    >
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
