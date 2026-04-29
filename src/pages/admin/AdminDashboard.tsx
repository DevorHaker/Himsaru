import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Mountain, LogOut, Mail, Users, Handshake, BarChart3,
  Check, X, Trash2, RefreshCw, Eye, Clock, ChevronDown,
  Inbox, AlertCircle, ShoppingBag
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
interface OrderItem {
  id: string; name: string; price: number; quantity: number; image?: string;
}
interface Order {
  id: string; userId: string; firstName: string; lastName: string;
  email: string; phone: string; address: string; city: string; state: string;
  pincode: string; totalAmount: number; status: string; createdAt: string;
  items: OrderItem[];
}

type Tab = 'overview' | 'orders' | 'contacts' | 'distributors';

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
  const { user, token, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<ContactMsg[]>([]);
  const [distributors, setDistributors] = useState<DistributorApp[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const authHeader = useCallback(() => token ?? undefined, [token]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, c, d, o] = await Promise.all([
        api.get('/admin/stats', token),
        api.get('/admin/contacts', token),
        api.get('/admin/distributors', token),
        api.get('/orders/admin', token),
      ]);
      setStats(s.data);
      setContacts(c.data);
      setDistributors(d.data);
      setOrders(o.data);
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

  const updateOrdStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://himsaru-backend.onrender.com/api'}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        toast({ title: 'Status updated', description: `Order status changed to ${status}.` });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const regularContacts = contacts; // All contacts, old orders might still be here but that's ok

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
    { id: 'contacts', label: `Messages (${regularContacts.length})`, icon: Mail },
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
                <StatCard icon={ShoppingBag} label="Orders" value={orders.length}
                  sub={orders.some(o => o.status === 'PENDING') ? 'PENDING' : undefined}
                  highlight={orders.some(o => o.status === 'PENDING')} />
                <StatCard icon={Mail} label="Total Messages" value={regularContacts.length}
                  sub={regularContacts.some(c => c.status === 'UNREAD') ? 'UNREAD' : undefined}
                  highlight={regularContacts.some(c => c.status === 'UNREAD')} />
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
                <p className="mt-1 text-sm text-cream/50">{regularContacts.filter(c => c.status === 'UNREAD').length} unread of {regularContacts.length} total</p>
              </div>
            </div>

            {regularContacts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-cream/30">
                <Inbox size={40} />
                <p>No contact messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {regularContacts.map((c) => (
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

        {/* ── Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-cream">Orders</h2>
                <p className="mt-1 text-sm text-cream/50">{orders.filter(o => o.status === 'PENDING').length} pending of {orders.length} total</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-cream/30">
                <ShoppingBag size={40} />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className={`rounded-2xl border transition-all ${o.status === 'PENDING' ? 'border-amber/25 bg-amber/5' : 'border-cream/10 bg-cream/5'}`}>
                    <button
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 flex-shrink-0 rounded-full ${o.status === 'PENDING' ? 'bg-amber' : 'bg-cream/20'}`} />
                        <div>
                          <p className="text-sm font-semibold text-cream">{o.firstName} {o.lastName}
                            <span className="ml-2 text-xs font-normal text-cream/45">{o.email}</span>
                          </p>
                          <p className="text-xs text-cream/60">Total: ₹{Number(o.totalAmount).toLocaleString()} · {o.items.length} items</p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2 ml-4">
                        <span className={statusBadge(o.status)}>{o.status}</span>
                        <span className="text-xs text-cream/35">{fmtDate(o.createdAt)}</span>
                        <ChevronDown size={14} className={`text-cream/40 transition-transform ${expandedId === o.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {expandedId === o.id && (
                      <div className="border-t border-cream/10 px-4 pb-4 pt-3">
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Items List */}
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream/50 mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {o.items.map(item => (
                                <div key={item.id} className="flex gap-3 text-sm">
                                  <div className="h-10 w-10 flex-shrink-0 rounded bg-cream/10 border border-cream/5 overflow-hidden">
                                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-cream">{item.name}</p>
                                    <p className="text-xs text-cream/60">{item.quantity} x ₹{Number(item.price).toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Details */}
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream/50 mb-3">Shipping Info</h4>
                            <div className="text-sm text-cream/80 space-y-1">
                              <p><span className="text-cream/40 w-16 inline-block">Phone:</span> {o.phone}</p>
                              <p><span className="text-cream/40 w-16 inline-block">Address:</span> {o.address}</p>
                              <p><span className="text-cream/40 w-16 inline-block">City:</span> {o.city}, {o.state} - {o.pincode}</p>
                            </div>

                            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream/50 mt-4 mb-3">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => updateOrdStatus(o.id, status)}
                                  disabled={o.status === status}
                                  className={`rounded-lg px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest transition-all ${o.status === status ? 'bg-cream/20 text-cream cursor-default' : 'bg-cream/5 text-cream/60 hover:bg-cream/10 hover:text-cream border border-cream/10'}`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
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
