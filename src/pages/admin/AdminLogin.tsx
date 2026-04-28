import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';
import { Mountain, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Welcome back 🏔', description: 'HIMSARU Admin Panel loaded.' });
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message || 'Invalid credentials.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-forest flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 20% 60%, hsl(36 91% 41% / 0.1), transparent 55%), radial-gradient(ellipse at 80% 30%, hsl(100 41% 30% / 0.15), transparent 55%)',
        }}
      />
      {/* Floating dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="animate-twinkle pointer-events-none absolute h-1 w-1 rounded-full bg-amber/40"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/15 text-amber shadow-gold">
            <Mountain size={28} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-cream tracking-[0.12em]">HIMSARU</h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber">Admin Panel</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-cream/15 bg-cream/5 p-8 backdrop-blur-sm">
          <h2 className="mb-1 text-center text-lg font-bold text-cream">Sign In to Dashboard</h2>
          <p className="mb-8 text-center text-xs text-cream/50">Restricted access — Admin only</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@himsaru.in"
                  className="w-full rounded-xl border border-cream/15 bg-cream/10 pl-11 pr-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-amber"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/60 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-cream/15 bg-cream/10 pl-11 pr-11 py-3 text-sm text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-amber"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-amber transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-forest shadow-gold transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Signing In...</>
              ) : (
                <><Lock size={14} /> Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-cream/30">
          HIMSARU © {new Date().getFullYear()} — Pure Pahadi Administration
        </p>
      </div>
    </div>
  );
}
