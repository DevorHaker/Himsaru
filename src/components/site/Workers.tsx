const artisans = [
  { initials: "SD", name: "Saraswati Devi", craft: "25+ years of traditional ghee making" },
  { initials: "KU", name: "Kamla Uniyal", craft: "Wild Himalayan honey harvesting expert" },
  { initials: "BB", name: "Bhagwati Bisht", craft: "Master of Pahadi spice blends" },
  { initials: "PR", name: "Pushpa Rawat", craft: "Keeper of the Pisyu Loon stone-grinding art" },
];

export const Workers = () => {
  return (
    <section
      id="workers"
      className="relative overflow-hidden bg-cream py-24"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-forest via-gold to-forest" />
      <div className="container-narrow">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/10 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-moss">
            👩‍🌾 The Heart of HIMSARU
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold text-forest">
            The <span className="text-gradient-gold">Women</span> Who Make It All
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic text-stone">
            Skilled, proud, rooted in tradition — the soul of HIMSARU
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {artisans.map((a) => (
            <div
              key={a.name}
              className="group rounded-3xl border border-border bg-card p-6 text-center shadow-soft transition-all hover:-translate-y-2 hover:shadow-elevated"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-gold font-display text-2xl font-bold text-forest shadow-gold transition-transform group-hover:scale-110">
                {a.initials}
              </div>
              <h3 className="mt-5 font-display text-base font-bold text-forest">
                {a.name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {a.craft}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
