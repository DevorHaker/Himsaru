import { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Mountain, LogOut, Mail, Users, Handshake, BarChart3,
  Check, X, Trash2, RefreshCw, Eye, Clock, ChevronDown,
  Inbox, AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalContacts: number;
  unreadContacts: number;
  totalApplications: number;
  pendingApplications: number;
  totalUsers: number;
}
interface ContactMsg {
  id: string; name: string; email: string; phone?: string;
  subject: string; message: string; status: string; createdAt: string;
}
interface DistributorApp {
  id: string; fullName: string; phone: string; email: string;
  city: string; state: string; businessType: string; experience: string;
  message?: string; status: string; createdAt: string;
}

type Tab = 'overview' | 'contacts' | 'distributors';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    UNREAD: 'bg-amber/20 text-amber border-amber/30',
    READ: 'bg-cream/10 text-cream/50 border-cream/15',
    PENDING: 'bg-amber/20 text-amber border-amber/30',
    APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return `inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${map[status] ?? 'bg-cream/10 text-cream/60 border-cream/20'}`;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, highlight }: {
  icon: any; label: string; value: number; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${highlight ? 'border-amber/30 bg-amber/10' : 'border-cream/10 bg-cream/5'}`}>
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? 'bg-amber/20 text-amber' : 'bg-cream/10 text-cream/60'}`}>
          <Icon size={18} />
        </div>
        {sub && <span className={statusBadge(sub === 'UNREAD' ? 'UNREAD' : 'PENDING')}>{sub}</span>}
      </div>
      <p className="mt-4 text-3xl font-bold text-cream">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-cream/50">{label}</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { user, token, logout } = useAdmin();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<ContactMsg[]>([]);
  const [distributors, setDistributors] = useState<DistributorApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const authHeader = useCallback(() => token ?? undefined, [token]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, c, d] = await Promise.all([
        api.get('/admin/stats', token),
        api.get('/admin/contacts', token),
        api.get('/admin/distributors', token),
      ]);
      setStats(s.data);
      setContacts(c.data);
      setDistributors(d.data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { logout(); onLogout(); };

  // ── Contact actions
  const markRead = async (id: string) => {
    try {
      await api.post(`/admin/contacts/${id}/read`, {}); // uses PATCH via workaround
      setContacts((c) => c.map((m) => m.id === id ? { ...m, status: 'READ' } : m));
      if (stats) setStats({ ...stats, unreadContacts: Math.max(0, stats.unreadContacts - 1) });
    } catch { /* handled below */ }
    // Use direct fetch for PATCH
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://himsaru-backend.onrender.com/api'}/admin/contacts/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setContacts((c) => c.map((m) => m.id === id ? { ...m, status: 'READ' } : m));
        if (stats) setStats({ ...stats, unreadContacts: Math.max(0, stats.unreadContacts - 1) });
      }
    } catch { /* noop */ }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://himsaru-backend.onrender.com/api'}/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setContacts((c) => c.filter((m) => m.id !== id));
        toast({ title: 'Deleted', description: 'Contact message removed.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // ── Distributor actions
  const updateDistStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://himsaru-backend.onrender.com/api'}/admin/distributors/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setDistributors((d) => d.map((a) => a.id === id ? { ...a, status } : a));
        toast({ title: `Application ${status.toLowerCase()}`, description: `Status updated to ${status}.` });
        if (stats) {
          const wasPending = distributors.find((a) => a.id === id)?.status === 'PENDING';
          setStats({ ...stats, pendingApplications: wasPending ? Math.max(0, stats.pendingApplications - 1) : stats.pendingApplications });
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'contacts', label: `Messages (${contacts.length})`, icon: Mail },
    { id: 'distributors', label: `Applications (${distributors.length})`, icon: Handshake },
  ];

  return (
    <div className="min-h-screen bg-gradient-forest text-cream">
      {/* ── Topbar */}
      <header className="sticky top-0 z-30 border-b border-cream/10 bg-forest/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/15 text-amber">
              <Mountain size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-cream leading-none">HIMSARU Admin</p>
              <p className="text-[0.6rem] text-cream/45 uppercase tracking-widest">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-cream/15 text-cream/50 hover:border-amber hover:text-amber transition-all"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-cream">{user?.firstName || user?.email}</p>
              <p className="text-[0.6rem] text-amber uppercase tracking-widest">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-cream/15 bg-cream/5 px-3 py-1.5 text-xs text-cream/70 hover:border-red-400/50 hover:text-red-400 transition-all"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab Nav */}
      <nav className="border-b border-cream/10 bg-forest/60 backdrop-blur-sm">
        <div className="container-narrow flex gap-1 overflow-x-auto py-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
                tab === t.id
                  ? 'bg-gold/20 text-amber border border-gold/30'
                  : 'text-cream/50 hover:text-cream hover:bg-cream/5'
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content */}
      <main className="container-narrow py-8">

        {/* ── Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-cream">Dashboard Overview</h2>
              <p className="mt-1 text-sm text-cream/50">Real-time data from your Neon PostgreSQL database.</p>
            </div>

            {stats ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Mail} label="Total Messages" value={stats.totalContacts}
                  sub={stats.unreadContacts > 0 ? 'UNREAD' : undefined}
                  highlight={stats.unreadContacts > 0} />
                <StatCard icon={Handshake} label="Distributor Apps" value={stats.totalApplications}
                  sub={stats.pendingApplications > 0 ? 'PENDING' : undefined}
                  highlight={stats.pendingApplications > 0} />
                <StatCard icon={Users} label="Registered Users" value={stats.totalUsers} />
                <StatCard icon={Clock} label="Pending Reviews" value={stats.pendingApplications} highlight={stats.pendingApplications > 0} />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl border border-cream/10 bg-cream/5" />
                ))}
              </div>
            )}

            {/* Recent contacts preview */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cream/60">Recent Messages</h3>
              <div className="space-y-2">
                {contacts.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-cream/10 bg-cream/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${c.status === 'UNREAD' ? 'bg-amber' : 'bg-cream/20'}`} />
                      <div>
                        <p className="text-sm font-semibold text-cream">{c.name}</p>
                        <p className="text-xs text-cream/45">{c.subject}</p>
                      </div>
                    </div>
                    <span className="text-xs text-cream/40">{fmtDate(c.createdAt)}</span>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-cream/30">
                    <Inbox size={32} />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Contacts Tab */}
        {tab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-cream">Contact Messages</h2>
                <p className="mt-1 text-sm text-cream/50">{contacts.filter(c => c.status === 'UNREAD').length} unread of {contacts.length} total</p>
              </div>
            </div>

            {contacts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-cream/30">
                <Inbox size={40} />
                <p>No contact messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className={`rounded-2xl border transition-all ${c.status === 'UNREAD' ? 'border-amber/25 bg-amber/5' : 'border-cream/10 bg-cream/5'}`}>
                    <button
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 flex-shrink-0 rounded-full ${c.status === 'UNREAD' ? 'bg-amber' : 'bg-cream/20'}`} />
                        <div>
                          <p className="text-sm font-semibold text-cream">{c.name}
                            <span className="ml-2 text-xs font-normal text-cream/45">{c.email}</span>
                          </p>
                          <p className="text-xs text-cream/60">{c.subject}</p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2 ml-4">
                        <span className={statusBadge(c.status)}>{c.status}</span>
                        <span className="text-xs text-cream/35">{fmtDate(c.createdAt)}</span>
                        <ChevronDown size={14} className={`text-cream/40 transition-transform ${expandedId === c.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {expandedId === c.id && (
                      <div className="border-t border-cream/10 px-4 pb-4 pt-3">
                        <p className="text-sm leading-relaxed text-cream/80">{c.message}</p>
                        {c.phone && <p className="mt-2 text-xs text-cream/45">📞 {c.phone}</p>}
                        <div className="mt-4 flex gap-2">
                          {c.status === 'UNREAD' && (
                            <button
                              onClick={() => markRead(c.id)}
                              className="flex items-center gap-1.5 rounded-lg bg-amber/15 px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/25 transition-colors"
                            >
                              <Eye size={12} /> Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Distributors Tab */}
        {tab === 'distributors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cream">Distributor Applications</h2>
              <p className="mt-1 text-sm text-cream/50">{distributors.filter(d => d.status === 'PENDING').length} pending of {distributors.length} total</p>
            </div>

            {distributors.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-cream/30">
                <AlertCircle size={40} />
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {distributors.map((d) => (
                  <div key={d.id} className={`rounded-2xl border transition-all ${d.status === 'PENDING' ? 'border-amber/25 bg-amber/5' : 'border-cream/10 bg-cream/5'}`}>
                    <button
                      onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-cream">{d.fullName}
                          <span className="ml-2 text-xs font-normal text-cream/45">{d.email}</span>
                        </p>
                        <p className="text-xs text-cream/55">{d.businessType} · {d.city}, {d.state}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2 ml-4">
                        <span className={statusBadge(d.status)}>{d.status}</span>
                        <span className="text-xs text-cream/35">{fmtDate(d.createdAt)}</span>
                        <ChevronDown size={14} className={`text-cream/40 transition-transform ${expandedId === d.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {expandedId === d.id && (
                      <div className="border-t border-cream/10 px-4 pb-4 pt-3 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2 text-xs">
                          {[
                            ['Phone', d.phone],
                            ['Experience', d.experience],
                            ['Business Type', d.businessType],
                            ['Location', `${d.city}, ${d.state}`],
                          ].map(([k, v]) => (
                            <div key={k} className="rounded-lg border border-cream/10 bg-cream/5 px-3 py-2">
                              <p className="text-cream/40 uppercase tracking-wider text-[0.6rem]">{k}</p>
                              <p className="mt-0.5 font-semibold text-cream">{v}</p>
                            </div>
                          ))}
                        </div>
                        {d.message && (
                          <div className="rounded-lg border border-cream/10 bg-cream/5 px-3 py-2">
                            <p className="text-[0.6rem] uppercase tracking-wider text-cream/40">Their message</p>
                            <p className="mt-0.5 text-xs text-cream/70">{d.message}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => updateDistStatus(d.id, 'APPROVED')}
                            disabled={d.status === 'APPROVED'}
                            className="flex items-center gap-1.5 rounded-lg bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => updateDistStatus(d.id, 'REJECTED')}
                            disabled={d.status === 'REJECTED'}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X size={12} /> Reject
                          </button>
                          {d.status !== 'PENDING' && (
                            <button
                              onClick={() => updateDistStatus(d.id, 'PENDING')}
                              className="flex items-center gap-1.5 rounded-lg bg-amber/10 px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/20 transition-colors"
                            >
                              <RefreshCw size={12} /> Reset to Pending
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
