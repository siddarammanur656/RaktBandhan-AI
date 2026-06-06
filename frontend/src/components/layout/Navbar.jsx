import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className="bg-red-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🩸</span> RaktBandhan AI
          </Link>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="hover:text-red-200 transition font-medium">
                  Dashboard
                </Link>
                {user.role === 'donor' && (
                  <Link to="/donor/profile" className="hover:text-red-200 transition font-medium">
                    Profile
                  </Link>
                )}
                <div className="text-red-200 text-sm hidden sm:block px-4 border-l border-red-500">
                  {user.name} ({user.role})
                </div>
                <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-white text-red-600 hover:bg-gray-100">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-red-200 transition font-medium">Login</Link>
                <Link to="/register" className="hover:text-red-200 transition font-medium">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
