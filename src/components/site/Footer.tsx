export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gold/20 bg-[hsl(109_45%_8%)] py-14 text-cream/70">
      <div className="container-narrow grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[50%_15%_50%_15%] bg-gradient-gold font-display text-lg font-bold text-forest">
              H
            </div>
            <div>
              <div className="font-display text-base font-bold tracking-display text-amber">HIMSARU</div>
              <div className="text-[0.55rem] uppercase tracking-[0.25em] text-cream/45">Pure Pahadi</div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed">
            Pure Taste of the Himalayas — bringing the authentic flavors of
            Uttarakhand to every home in India. Crafted by women, driven by
            mountains.
          </p>
        </div>

        <div>
          <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-amber">Quick Links</h4>
          <ul className="mt-5 space-y-2 text-sm">
            {["Home", "Our Story", "Products", "Distribute", "Contact"].map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase().replace(/\s/g, "")}`} className="transition-colors hover:text-amber">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-amber">Our Products</h4>
          <ul className="mt-5 space-y-2 text-sm">
            {["A2 Badri Ghee", "Wild Honey", "Pisyu Loon Salt", "Pahadi Rajma", "Mountain Dals"].map((l) => (
              <li key={l}>
                <a href="#products" className="transition-colors hover:text-amber">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-amber">Contact</h4>
          <ul className="mt-5 space-y-2 text-sm">
            <li>Tarikhet, Almora</li>
            <li>Uttarakhand, India</li>
            <li>hello@himsaru.in</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>
      </div>

      <div className="container-narrow mt-12 border-t border-cream/10 pt-6 text-center text-xs text-cream/50">
        © {year} <span className="font-display tracking-display text-amber">HIMSARU</span>. All rights reserved. Made with ♥ in the Himalayas.
      </div>
    </footer>
  );
};
