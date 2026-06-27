import ScissorsLoader from '@/components/ScissorsLoader';
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: {children: React.ReactNode;}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div data-ev-id="ev_cffee3ed3e" className="min-h-screen flex items-center justify-center bg-stone-100">
        <ScissorsLoader />
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}