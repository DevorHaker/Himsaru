import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoading } = useAdmin();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // If the hook is still checking localStorage/API
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest text-cream">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // If already logged in via hook, or just logged in via form
  if (user || isAuthenticated) {
    return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
  }

  // Otherwise, show login
  return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
}
