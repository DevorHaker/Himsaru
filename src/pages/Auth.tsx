import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Mountain, Lock, Mail, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { user, login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        // Redirect to where they came from or home
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    }
  }, [user, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const loggedInUser = await login(email, password);
        toast({ title: 'Welcome back 🏔', description: 'Successfully logged in.' });
        if (loggedInUser.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        await register({ email, password, firstName, lastName });
        toast({ title: 'Welcome to HIMSARU 🏔', description: 'Your account has been created.' });
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      toast({ title: 'Authentication Failed', description: err.message || 'An error occurred.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest text-cream">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

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
        {/* Logo & Header */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/15 text-amber shadow-gold cursor-pointer" onClick={() => navigate('/')}>
            <Mountain size={28} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-cream tracking-[0.12em]">HIMSARU</h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-cream/15 bg-cream/5 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields for Registration */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/60 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
                    <input
                      required
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Anjali"
                      className="w-full rounded-xl border border-cream/15 bg-cream/10 pl-11 pr-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-amber"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/60 mb-2">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Rawat"
                    className="w-full rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-amber"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
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
                  required
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
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
              type="submit"
              disabled={submitting}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-forest shadow-gold transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> {isLogin ? 'Signing In...' : 'Creating...'}</>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'}</>
              )}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-xs text-cream/60">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-amber hover:underline transition-all"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-cream/30">
          <button onClick={() => navigate('/')} className="hover:text-amber transition-colors">
            ← Back to Home
          </button>
        </p>
      </div>
    </div>
  );
}
