import { useState } from "react";
import { Check, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const benefits = [
  "Authentic Pahadi products with high margins",
  "Marketing & branding support included",
  "Direct partnership with mountain artisans",
  "Exclusive territory rights available",
];

export const Distributor = () => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    try {
      await api.post('/distributor', {
        fullName: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        state: data.state || 'N/A',
        businessType: data.businessType || 'General',
        experience: data.experience || 'N/A',
        message: data.message || undefined,
      });
      form.reset();
      toast({
        title: "Application received 🙏",
        description: "Namaste! Our team will reach out within 48 hours from the mountains.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit application.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <>
      <section id="distributor" className="relative overflow-hidden bg-gradient-earth py-24">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, hsl(var(--gold) / 0.12), transparent 60%), radial-gradient(ellipse at 80% 50%, hsl(var(--moss) / 0.12), transparent 60%)",
          }}
        />
        <div className="container-narrow relative grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber">
              🤝 Partner With Us
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-tight text-cream">
              Become a <span className="text-gradient-gold">Distributor</span>
              <br /> of HIMSARU
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream/70">
              Join our growing network of passionate distributors who carry the
              pure taste of the Himalayas to every corner of India. Partner with
              HIMSARU and empower local Uttarakhand women.
            </p>

            <ul className="mt-8 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-cream/85">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gold/20 text-amber">
                    <Check size={13} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-cream/15 bg-cream/5 p-8 backdrop-blur-sm sm:p-10"
          >
            <h3 className="text-center font-serif text-2xl font-bold text-amber">
              🏔 Apply to Distribute
            </h3>
            <div className="mt-6 space-y-4">
              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "Your name" },
                { label: "Phone", name: "phone", type: "tel", placeholder: "+91" },
                { label: "Email", name: "email", type: "email", placeholder: "you@email.com" },
                { label: "City / Region", name: "city", type: "text", placeholder: "City, State" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cream/60">
                    {f.label}
                  </label>
                  <input
                    required
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    className="mt-2 w-full rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-amber"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cream/60">
                  Tell us about yourself
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Your background, network, why HIMSARU..."
                  className="mt-2 w-full resize-none rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-amber"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-xl bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-forest shadow-gold transition-all hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Location strip */}
      <div className="border-t border-gold/20 bg-forest py-10">
        <div className="container-narrow grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              label: "Our Location",
              text: "Tarikhet, Almora, Uttarakhand",
              sub: "In the arms of the Himalayas",
            },
            {
              icon: Phone,
              label: "Call / WhatsApp",
              text: "+91 98765 43210",
              sub: "Mon–Sat, 9am – 7pm IST",
            },
            {
              icon: Mail,
              label: "Email Us",
              text: "hello@himsaru.in",
              sub: "We reply within 24 hours",
            },
          ].map(({ icon: Icon, label, text, sub }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/15 text-amber">
                <Icon size={16} />
              </div>
              <div>
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/55">
                  {label}
                </h4>
                <p className="mt-1 text-sm font-semibold text-cream">{text}</p>
                <p className="text-xs text-cream/55">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
