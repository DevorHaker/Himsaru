import { useState } from "react";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export const Contact = () => {
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    try {
      await api.post('/contact', {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        subject: data.subject,
        message: data.message,
      });
      form.reset();
      toast({ title: "Message sent ✨", description: "Dhanyavaad! We'll get back to you soon." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send message.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };


  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-forest py-24">
      <div className="container-narrow grid gap-14 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber">
            ✉ Reach the Mountains
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-tight text-cream">
            Get in <span className="text-gradient-gold">Touch</span> with Us
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/70">
            Want to order, partner, share feedback, or just say namaste? Our
            mountains are always open.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: MapPin, label: "Location", text: "Tarikhet, Almora, Uttarakhand, India" },
              { icon: Phone, label: "Ajay — +91 98765 43210", text: "Vishal — +91 98765 43211" },
              { icon: Mail, label: "General", text: "hello@himsaru.in" },
              { icon: MessageCircle, label: "WhatsApp", text: "Quick replies, 9am – 9pm" },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/15 text-amber">
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-cream">{label}</h4>
                  <p className="mt-0.5 text-sm text-cream/65">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-cream/5 text-cream/75 transition-all hover:-translate-y-1 hover:border-amber hover:bg-gold/15 hover:text-amber"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-cream/15 bg-cream/5 p-8 backdrop-blur-sm sm:p-10"
        >
          <h3 className="text-center font-serif text-2xl font-bold text-amber">
            ✉ Send Us a Message
          </h3>
          <div className="mt-6 space-y-4">
            {[
              { label: "Your Name", name: "name", type: "text" },
              { label: "Email Address", name: "email", type: "email" },
              { label: "Subject", name: "subject", type: "text" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cream/60">
                  {f.label}
                </label>
                <input
                  required
                  name={f.name}
                  type={f.type}
                  className="mt-2 w-full rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm text-cream outline-none transition-colors focus:border-amber"
                />
              </div>
            ))}
            <div>
              <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cream/60">
                Message
              </label>
              <textarea
                required
                name="message"
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm text-cream outline-none transition-colors focus:border-amber"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-forest shadow-gold transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {sending ? "Sending..." : (<><Send size={14} /> Send Message</>)}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
