import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Mountain, LogOut, Mail, Users, Handshake, BarChart3,
  Check, X, Trash2, RefreshCw, Eye, Clock, ChevronDown,
  Inbox, AlertCircle, ShoppingBag, Package, Plus, Pencil,
  Star, Archive, ToggleLeft, ToggleRight, ImageOff
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
interface Product {
  id: string; name: string; slug: string; category: string;
  description: string; pricing: number; stock: number; images: string[];
  sku: string; isFeatured: boolean; status: string; createdAt: string;
}
const EMPTY_PRODUCT = {
  name: '', slug: '', category: '', description: '',
  pricing: '', stock: '', images: '', sku: '', isFeatured: false, status: 'ACTIVE',
};

type Tab = 'overview' | 'orders' | 'contacts' | 'distributors' | 'products';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Product management state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<typeof EMPTY_PRODUCT>(EMPTY_PRODUCT);
  const [productSaving, setProductSaving] = useState(false);
  const [productFilter, setProductFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL');

  const authHeader = useCallback(() => token ?? undefined, [token]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, c, d, o, p] = await Promise.all([
        api.get('/admin/stats', token),
        api.get('/admin/contacts', token),
        api.get('/admin/distributors', token),
        api.get('/orders/admin', token),
        api.get('/products/admin/all', token),
      ]);
      setStats(s.data);
      setContacts(c.data);
      setDistributors(d.data);
      setOrders(o.data);
      setProducts(p.data);
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

  // ── Product actions
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setShowProductForm(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, slug: p.slug, category: p.category,
      description: p.description, pricing: String(p.pricing),
      stock: String(p.stock), images: p.images.join(', '),
      sku: p.sku, isFeatured: p.isFeatured, status: p.status,
    });
    setShowProductForm(true);
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const saveProduct = async () => {
    setProductSaving(true);
    try {
      const payload = {
        ...productForm,
        pricing: parseFloat(productForm.pricing as string),
        stock: parseInt(productForm.stock as string, 10),
        images: (productForm.images as string).split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      const baseUrl = import.meta.env.VITE_API_URL || 'https://himsaru-backend.onrender.com/api';
      const url = editingProduct
        ? `${baseUrl}/products/${editingProduct.id}`
        : `${baseUrl}/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({ title: editingProduct ? 'Product updated' : 'Product created', description: data.message });
      setShowProductForm(false);
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProductSaving(false);
    }
  };

  const archiveProduct = async (id: string, current: string) => {
    const newStatus = current === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    if (!confirm(`${newStatus === 'ARCHIVED' ? 'Archive' : 'Restore'} this product?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://himsaru-backend.onrender.com/api'}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
        toast({ title: `Product ${newStatus.toLowerCase()}` });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://himsaru-backend.onrender.com/api'}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isFeatured: !current }),
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, isFeatured: !current } : p));
      }
    } catch { /* noop */ }
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

  const regularContacts = contacts;
  const filteredProducts = productFilter === 'ALL' ? products : products.filter(p => p.status === productFilter);

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
    { id: 'products', label: `Products (${products.length})`, icon: Package },
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

        {/* ── Products Tab */}
        {tab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-cream">Product Catalogue</h2>
                <p className="mt-1 text-sm text-cream/50">{products.length} total products</p>
              </div>
              <button
                onClick={openCreateProduct}
                className="flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-forest shadow-gold hover:-translate-y-0.5 transition-transform"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setProductFilter(f)}
                  className={`rounded-full border px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest transition-all ${
                    productFilter === f
                      ? 'border-amber/40 bg-amber/15 text-amber'
                      : 'border-cream/10 bg-cream/5 text-cream/40 hover:text-cream/70'
                  }`}
                >
                  {f} {f === 'ALL' ? `(${products.length})` : `(${products.filter(p => p.status === f).length})`}
                </button>
              ))}
            </div>

            {/* Products grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-cream/30">
                <Package size={40} />
                <p>No products found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    className={`rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 ${
                      p.status === 'ARCHIVED' ? 'border-cream/5 bg-cream/3 opacity-60' :
                      p.status === 'DRAFT' ? 'border-amber/20 bg-amber/5' :
                      'border-cream/10 bg-cream/5'
                    }`}
                  >
                    {/* Product image */}
                    <div className="relative h-36 w-full overflow-hidden bg-cream/5">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-cream/20">
                          <ImageOff size={28} />
                        </div>
                      )}
                      {/* Status badge on image */}
                      <div className="absolute top-2 left-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest ${
                          p.status === 'ACTIVE' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                          p.status === 'DRAFT' ? 'bg-amber/20 border-amber/30 text-amber' :
                          'bg-red-500/20 border-red-500/30 text-red-400'
                        }`}>{p.status}</span>
                      </div>
                      {/* Featured star */}
                      <button
                        onClick={() => toggleFeatured(p.id, p.isFeatured)}
                        className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                          p.isFeatured
                            ? 'border-amber/50 bg-amber/25 text-amber'
                            : 'border-cream/15 bg-black/30 text-cream/30 hover:text-amber'
                        }`}
                        title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star size={12} fill={p.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Product info */}
                    <div className="p-4">
                      <p className="text-xs text-cream/40 uppercase tracking-widest mb-0.5">{p.category}</p>
                      <h3 className="font-semibold text-cream text-sm leading-tight truncate">{p.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-amber">₹{Number(p.pricing).toLocaleString()}</span>
                        <span className={`text-xs font-semibold ${p.stock <= 5 ? 'text-red-400' : 'text-cream/40'}`}>
                          Stock: {p.stock}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 border-t border-cream/10 pt-3">
                        <button
                          onClick={() => openEditProduct(p)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cream/10 py-1.5 text-xs font-semibold text-cream/70 hover:bg-cream/20 hover:text-cream transition-all"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                        <button
                          onClick={() => archiveProduct(p.id, p.status)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                            p.status === 'ARCHIVED'
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          <Archive size={11} />
                          {p.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4">
          <div className="my-8 w-full max-w-2xl rounded-3xl border border-cream/15 bg-forest shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-cream/10 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-cream">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowProductForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-cream/15 text-cream/50 hover:border-red-400/40 hover:text-red-400 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form body */}
            <div className="p-6 space-y-5">
              {/* Name + auto-slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Product Name *</label>
                  <input
                    name="name"
                    value={productForm.name}
                    onChange={e => {
                      handleProductFormChange(e);
                      if (!editingProduct) setProductForm(prev => ({ ...prev, slug: autoSlug(e.target.value) }));
                    }}
                    placeholder="Pahadi Cow Ghee"
                    className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Slug *</label>
                  <input
                    name="slug"
                    value={productForm.slug}
                    onChange={handleProductFormChange}
                    placeholder="pahadi-cow-ghee"
                    className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Category + SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Category *</label>
                  <input
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    placeholder="Dairy, Spices, Grains..."
                    className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">SKU *</label>
                  <input
                    name="sku"
                    value={productForm.sku}
                    onChange={handleProductFormChange}
                    placeholder="HSR-GHE-001"
                    className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Price (₹) *</label>
                  <input
                    name="pricing"
                    type="number"
                    value={productForm.pricing}
                    onChange={handleProductFormChange}
                    placeholder="1500"
                    className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Stock Qty *</label>
                  <input
                    name="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    placeholder="100"
                    className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Description *</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  rows={3}
                  placeholder="A rich, pure A2 cow ghee from the Himalayas..."
                  className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Image URLs (comma separated)</label>
                <input
                  name="images"
                  value={productForm.images}
                  onChange={handleProductFormChange}
                  placeholder="/assets/ghee.jpg, https://..."
                  className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-amber outline-none transition-colors"
                />
              </div>

              {/* Status + Featured */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-32">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-cream/50 mb-1.5">Status</label>
                  <select
                    name="status"
                    value={productForm.status}
                    onChange={handleProductFormChange}
                    className="w-full rounded-xl border border-cream/15 bg-forest px-4 py-2.5 text-sm text-cream focus:border-amber outline-none transition-colors"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => setProductForm(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    className={`transition-all ${productForm.isFeatured ? 'text-amber' : 'text-cream/30'}`}
                  >
                    {productForm.isFeatured ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                  <span className="text-sm text-cream/60">Featured Product</span>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-cream/10 px-6 py-4">
              <button
                onClick={() => setShowProductForm(false)}
                className="rounded-xl border border-cream/15 px-5 py-2 text-xs font-bold uppercase tracking-widest text-cream/60 hover:border-cream/30 hover:text-cream transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={productSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-2 text-xs font-bold uppercase tracking-widest text-forest shadow-gold hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {productSaving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
