import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  User, Mail, Phone, MapPin, Package, Save, ArrowLeft,
  Settings, LogOut, ChevronRight, CheckCircle2, RefreshCw
} from "lucide-react";

// Profile Page - Updated to ensure latest API helper is loaded
export default function Profile() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      });
    }
  }, [authLoading, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await api.put("/auth/me", formData, token);
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
      // Refresh user data is handled by useAuth typically, but we might need a refresh call
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest">
        <RefreshCw className="h-8 w-8 animate-spin text-amber" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-forest text-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-cream/10 bg-forest/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl flex h-16 items-center justify-between px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber hover:text-gold transition-colors"
          >
            <ArrowLeft size={15} />
            Store
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[50%_15%_50%_15%] bg-gradient-gold font-display text-sm font-bold text-forest shadow-gold">
              H
            </div>
            <span className="font-display text-sm font-bold tracking-display text-amber">
              MY PROFILE
            </span>
          </div>

          <button
            onClick={logout}
            className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sidebar / Quick Links */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-cream/10 bg-cream/5 p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold text-forest">
                <User size={40} />
              </div>
              <h2 className="font-display text-xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest">{user.role}</p>
            </div>

            <nav className="space-y-2">
              <Link
                to="/orders"
                className="flex items-center justify-between rounded-2xl border border-cream/10 bg-cream/5 p-4 hover:border-amber/40 hover:bg-amber/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10 text-amber">
                    <Package size={20} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-cream/80">Order History</span>
                </div>
                <ChevronRight size={18} className="text-cream/20 group-hover:text-amber transition-colors" />
              </Link>

              <div className="flex items-center justify-between rounded-2xl border border-amber/30 bg-amber/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber text-forest">
                    <Settings size={20} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-amber">Settings</span>
                </div>
                <CheckCircle2 size={18} className="text-amber" />
              </div>
            </nav>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-cream/10 bg-cream/5 p-8">
              <h3 className="font-display text-2xl font-bold mb-6">Personal Details</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/20" size={16} />
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-cream/10 bg-cream/5 py-3 pl-12 pr-4 text-sm focus:border-amber outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/20" size={16} />
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-cream/10 bg-cream/5 py-3 pl-12 pr-4 text-sm focus:border-amber outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">Email (Locked)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/10" size={16} />
                    <input
                      disabled
                      value={user.email}
                      className="w-full rounded-2xl border border-cream/5 bg-cream/2 py-3 pl-12 pr-4 text-sm text-cream/30 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/20" size={16} />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className="w-full rounded-2xl border border-cream/10 bg-cream/5 py-3 pl-12 pr-4 text-sm focus:border-amber outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-cream/10">
                  <h4 className="font-display text-lg font-bold">Shipping Address</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3 text-cream/20" size={16} />
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House No, Street, Locality"
                        className="w-full rounded-2xl border border-cream/10 bg-cream/5 py-3 pl-12 pr-4 text-sm focus:border-amber outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">City</label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-cream/10 bg-cream/5 py-3 px-4 text-sm focus:border-amber outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">State</label>
                      <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-cream/10 bg-cream/5 py-3 px-4 text-sm focus:border-amber outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/40 ml-1">Pincode</label>
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-cream/10 bg-cream/5 py-3 px-4 text-sm focus:border-amber outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-gold py-4 text-sm font-bold uppercase tracking-[0.2em] text-forest shadow-gold hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save size={18} />}
                  Save Information
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
