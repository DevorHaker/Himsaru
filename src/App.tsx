import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/Auth.tsx";
import Checkout from "./pages/Checkout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import { AuthProvider, useAuth } from "./hooks/useAuth.tsx";
import { CartProvider } from "./contexts/CartContext.tsx";
import { CartSheet } from "./components/cart/CartSheet.tsx";
import { FloatingCart } from "./components/cart/FloatingCart.tsx";
import { Navigate } from "react-router-dom";
const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-forest flex items-center justify-center text-cream">Loading...</div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartSheet />
            <FloatingCart />
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard onLogout={() => {}} /></ProtectedAdminRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
