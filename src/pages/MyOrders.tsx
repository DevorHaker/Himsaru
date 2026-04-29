import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  ArrowLeft, Package, PackageCheck, Truck, CheckCircle2,
  XCircle, Clock, RefreshCw, ChevronDown, ShoppingBag, MapPin,
  Phone, Mail, Calendar
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

const STATUS_META: Record<string, {
  icon: any; label: string; color: string; bg: string; border: string; desc: string;
}> = {
  PENDING: {
    icon: Clock,
    label: "Order Placed",
    color: "text-amber",
    bg: "bg-amber/15",
    border: "border-amber/30",
    desc: "We've received your order and are reviewing it.",
  },
  PROCESSING: {
    icon: Package,
    label: "Processing",
    color: "text-blue-400",
    bg: "bg-blue-400/15",
    border: "border-blue-400/30",
    desc: "Your order is being carefully packed.",
  },
  SHIPPED: {
    icon: Truck,
    label: "Shipped",
    color: "text-purple-400",
    bg: "bg-purple-400/15",
    border: "border-purple-400/30",
    desc: "Your order is on its way to you!",
  },
  DELIVERED: {
    icon: PackageCheck,
    label: "Delivered",
    color: "text-green-400",
    bg: "bg-green-400/15",
    border: "border-green-400/30",
    desc: "Your order has been delivered. Enjoy!",
  },
  CANCELLED: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/15",
    border: "border-red-400/30",
    desc: "This order has been cancelled.",
  },
};

// ─── Order Progress Bar ────────────────────────────────────────────────────────
function OrderProgress({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
        <XCircle size={18} className="text-red-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-red-400">This order was cancelled</p>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status as any);

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="relative flex items-center justify-between">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-cream/10" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-amber to-gold transition-all duration-700"
          style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
        />

        {STATUS_STEPS.map((step, idx) => {
          const meta = STATUS_META[step];
          const Icon = meta.icon;
          const isDone = idx <= currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div key={step} className="relative flex flex-col items-center gap-2 z-10">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                isDone
                  ? `${meta.bg} ${meta.border} ${meta.color}`
                  : "border-cream/15 bg-forest text-cream/25"
              } ${isActive ? "scale-110 shadow-lg" : ""}`}>
                {isDone && idx < currentIdx
                  ? <CheckCircle2 size={18} />
                  : <Icon size={16} />
                }
              </div>
              <span className={`text-[0.6rem] font-bold uppercase tracking-widest ${
                isDone ? meta.color : "text-cream/30"
              }`}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current status description */}
      {STATUS_META[status] && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${STATUS_META[status].bg} ${STATUS_META[status].border}`}>
          <span className={`text-sm font-medium ${STATUS_META[status].color}`}>
            {STATUS_META[status].desc}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Single Order Card ─────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const StatusIcon = meta.icon;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="rounded-3xl border border-cream/10 bg-cream/5 overflow-hidden transition-all hover:border-cream/20">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        {/* Status icon */}
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border ${meta.bg} ${meta.border} ${meta.color}`}>
          <StatusIcon size={24} />
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest ${meta.bg} ${meta.border} ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-xs text-cream/35">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <p className="text-cream font-semibold text-sm truncate">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹{Number(order.totalAmount).toLocaleString()}
          </p>
          <p className="text-xs text-cream/40 mt-0.5 flex items-center gap-1">
            <Calendar size={10} />
            Placed on {fmtDate(order.createdAt)}
          </p>
        </div>

        {/* Expand arrow */}
        <ChevronDown
          size={18}
          className={`text-cream/30 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-cream/10 p-6 space-y-6">

          {/* Progress tracker */}
          <OrderProgress status={order.status} />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Items */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/40 mb-3">
                Items Ordered
              </h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden border border-cream/10 bg-cream/5">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-cream/20">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cream truncate">{item.name}</p>
                      <p className="text-xs text-cream/45">
                        {item.quantity} × ₹{Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-amber flex-shrink-0">
                      ₹{(item.quantity * Number(item.price)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 flex justify-between border-t border-cream/10 pt-4">
                <span className="text-sm font-bold uppercase tracking-widest text-cream/60">Total</span>
                <span className="text-lg font-bold text-amber">₹{Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>

            {/* Shipping details */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/40 mb-3">
                Delivery Details
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cream/5 text-cream/40">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-cream">{order.firstName} {order.lastName}</p>
                    <p className="text-cream/55 text-xs leading-relaxed">
                      {order.address}<br />{order.city}, {order.state} — {order.pincode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cream/5 text-cream/40">
                    <Phone size={14} />
                  </div>
                  <span className="text-cream/70">{order.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cream/5 text-cream/40">
                    <Mail size={14} />
                  </div>
                  <span className="text-cream/70">{order.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MyOrders() {
  const { user, token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/orders/myorders", token);
      setOrders(res.data);
    } catch (err: any) {
      setError(err.message || "Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (token) fetchOrders();
  }, [authLoading, user, token, fetchOrders, navigate]);

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
            Back to Store
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[50%_15%_50%_15%] bg-gradient-gold font-display text-sm font-bold text-forest shadow-gold">
              H
            </div>
            <span className="font-display text-sm font-bold tracking-display text-amber hidden sm:block">
              HIMSARU
            </span>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-cream/15 text-cream/50 hover:border-amber hover:text-amber transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">My Orders</h1>
          {user && (
            <p className="mt-1 text-sm text-cream/50">
              Tracking orders for <span className="text-amber font-semibold">{user.email}</span>
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {(loading || authLoading) && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl border border-cream/10 bg-cream/5" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <XCircle size={40} className="text-red-400/60" />
            <p className="text-sm text-cream/50">{error}</p>
            <button
              onClick={fetchOrders}
              className="rounded-xl bg-cream/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-cream hover:bg-cream/20 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cream/15 bg-cream/5 text-cream/30">
              <ShoppingBag size={36} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-cream">No Orders Yet</p>
              <p className="mt-1 text-sm text-cream/45">Your future orders will appear here.</p>
            </div>
            <Link
              to="/"
              className="mt-2 rounded-full bg-gradient-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] text-forest shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
