import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/contexts/auth_context';

export default function Logout() {
  const router = useRouter();
  const { logout } = useAuth();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include'
        });
        await logout();
        router.push('/');
      } catch (error) {
        console.error('Logout failed:', error);
        setError('Failed to logout. Please try again.');
      }
    };

    handleLogout();
  }, [logout, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-gold">
        <svg 
          className="animate-spin h-8 w-8 mx-auto mb-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-white text-center">Logging out...</p>
      </div>
    </div>
  );
}