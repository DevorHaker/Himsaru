import aboutImg from "@/assets/about-woman.jpg";
import { Leaf, Heart, Mountain, Users } from "lucide-react";

const values = [
  { icon: Leaf, title: "100% Natural", desc: "Zero chemicals or preservatives. Ever." },
  { icon: Users, title: "Women Empowered", desc: "Crafted by Uttarakhand's mountain women." },
  { icon: Mountain, title: "Mountain Origins", desc: "Sourced from pristine Himalayan valleys." },
  { icon: Heart, title: "Community First", desc: "Every purchase supports Pahadi families." },
];

export const About = () => {
  return (
    <section id="about" className="relative overflow-hidden bg-cream py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[18vw] font-bold text-moss/[0.04]"
      >
        HIMSARU
      </div>

      <div className="container-narrow relative grid items-center gap-16 lg:grid-cols-2">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-deep">
            <img
              src={aboutImg}
              alt="Pahadi woman pouring fresh ghee in a traditional mountain kitchen"
              className="h-full w-full object-cover"
              loading="lazy"
              width={1024}
              height={1280}
            />
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-2xl bg-gradient-gold px-6 py-5 text-center shadow-gold sm:-right-6">
            <div className="font-display text-3xl font-bold text-forest">25+</div>
            <div className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-bark">
              Years of Tradition
            </div>
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/10 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-moss">
            🌿 Our Story
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-bold leading-tight text-forest">
            Born in the <span className="text-gradient-gold">Mountains</span>,
            <br /> Made with Love
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            HIMSARU was born from a deep love for Uttarakhand — its land, its
            people, and its age-old traditions. The name echoes the Himalayan
            soul: <em>"Him"</em> for the eternal snows, <em>"Saru"</em> for the
            sacred cedar trees that blanket these mountains.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Every jar carries the patience of slow craft, the warmth of a
            wood-fired kitchen, and the quiet strength of the women who refuse
            to let purity become a memory.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-moss/15 bg-card p-5 transition-all hover:-translate-y-1 hover:border-moss/40 hover:shadow-soft"
              >
                <Icon className="mb-2 text-moss" size={22} />
                <h3 className="text-sm font-bold text-forest">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
