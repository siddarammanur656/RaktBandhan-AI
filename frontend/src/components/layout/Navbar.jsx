import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';

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
    <nav className="fixed top-0 w-full z-50 glass animate-fade-in-up border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <HeartPulse className="w-6 h-6 animate-pulse-slow" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-rose-400 font-extrabold tracking-tight">
              RaktBandhan AI
            </span>
          </Link>
          <div className="flex gap-6 items-center">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="relative font-medium text-foreground/80 hover:text-primary transition-colors group">
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
                </Link>
                {user.role === 'donor' && (
                  <Link to="/donor/profile" className="relative font-medium text-foreground/80 hover:text-primary transition-colors group">
                    Profile
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
                  </Link>
                )}
                <div className="text-muted-foreground text-sm hidden sm:block pl-6 border-l border-border font-medium">
                  Hi, <span className="text-foreground">{user.name}</span>
                </div>
                <Button variant="default" size="sm" onClick={handleLogout} className="rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="relative font-medium text-foreground/80 hover:text-primary transition-colors group">
                  Login
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
