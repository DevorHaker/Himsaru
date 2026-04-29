import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Mountain, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
  });

  useEffect(() => {
    // If cart is empty and we haven't just successfully submitted, go home
    if (items.length === 0 && !isSuccess) {
      navigate("/");
    }
  }, [items, isSuccess, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!token) {
        throw new Error("You must be logged in to place an order.");
      }

      console.log('[Checkout] Submitting order with token:', token ? 'present' : 'MISSING');
      console.log('[Checkout] Items:', items);

      const result = await api.post("/orders", {
        items,
        totalAmount: totalPrice,
        ...formData
      }, token);

      console.log('[Checkout] Order success:', result);
      clearCart();
      setIsSuccess(true);
      toast({ title: "Order Placed", description: "Your order request has been sent successfully!" });
    } catch (error: any) {
      console.error('[Checkout] Order error:', error);
      toast({ title: "Order Failed", description: error.message || "Could not place order.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-forest flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl border border-cream/15 bg-cream/5 backdrop-blur-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/20 text-gold mb-6 shadow-gold">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="font-display text-3xl font-bold text-cream mb-4">Order Received!</h1>
          <p className="text-cream/70 mb-8 leading-relaxed">
            Thank you for your order, {formData.firstName}. We will contact you shortly to confirm the delivery details.
          </p>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-gradient-gold px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-forest shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Return to Home
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="rounded-full border border-cream/20 bg-cream/5 px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-cream transition-all hover:bg-cream/10"
          >
            Track My Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist text-forest selection:bg-amber selection:text-forest">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-forest/95 backdrop-blur-md py-4 px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-amber hover:text-gold flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[50%_15%_50%_15%] bg-gradient-gold font-display text-sm font-bold text-forest shadow-gold">
              H
            </div>
            <span className="font-display text-lg font-bold tracking-display text-amber hidden sm:block">HIMSARU</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Order Summary Column */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <div className="sticky top-28 rounded-3xl border border-gold/20 bg-white p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold text-forest mb-6 uppercase tracking-widest">Order Summary</h2>
              
              <ul className="space-y-4 mb-6">
                {items.map(item => (
                  <li key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="font-bold text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                    <div className="font-serif font-bold text-gold flex items-center">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 border-t border-border pt-6 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated later</span>
                </div>
              </div>

              <div className="flex justify-between border-t border-gold/20 pt-6">
                <span className="font-display font-bold text-lg uppercase tracking-widest">Total</span>
                <span className="font-serif font-bold text-2xl text-forest">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <h1 className="font-display text-3xl font-bold text-forest mb-8">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Contact Info */}
              <section className="space-y-4">
                <h3 className="font-semibold uppercase tracking-widest text-sm text-stone border-b border-border pb-2">1. Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                </div>
              </section>

              {/* Shipping Info */}
              <section className="space-y-4">
                <h3 className="font-semibold uppercase tracking-widest text-sm text-stone border-b border-border pb-2">2. Shipping Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">Street Address</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">State</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-forest mb-1">PIN Code</label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
                  </div>
                </div>
              </section>

              {/* Payment Method (Placeholder) */}
              <section className="space-y-4">
                <h3 className="font-semibold uppercase tracking-widest text-sm text-stone border-b border-border pb-2">3. Payment</h3>
                <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-4 border-gold bg-white"></div>
                  <span className="text-sm font-bold">Cash on Delivery / Pay Later</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  We will contact you to confirm the order and share payment details before dispatching your package.
                </p>
              </section>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forest py-4 text-sm font-bold uppercase tracking-[0.18em] text-cream shadow-elevated transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Complete Order"}
              </button>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
