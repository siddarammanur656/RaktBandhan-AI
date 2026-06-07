import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill all fields');
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success('Login successful');
      if (res.user.role === 'patient') navigate('/patient/dashboard');
      else if (res.user.role === 'donor') navigate('/donor/dashboard');
      else if (res.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      toast.error(res.error || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] md:min-h-screen w-full bg-white animate-fade-in overflow-hidden -mt-28 md:mt-0 relative z-50">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:flex-none lg:w-[60%] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand mb-8">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
            </div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-[#09090B]">Welcome back</h2>
            <p className="mt-2 text-sm text-[#52525B]">
              Sign in to manage your blood requests and donations.
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#18181B]">Email address</Label>
                <Input 
                  id="email" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#18181B]">Password</Label>
                <Input 
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-[#F4F4F5]">
              <p className="text-center text-sm text-[#52525B]">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-[40%] bg-brand-gradient">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
           <div className="max-w-lg space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium shadow-lg">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                Trusted by Blood Warriors
             </div>
             <h1 className="text-5xl font-display font-bold tracking-tight leading-[1.1]">Every drop counts.<br />Every connection matters.</h1>
             <p className="text-lg text-white/80 leading-relaxed font-medium">
               Join thousands of donors and hospitals using our AI-powered platform to match blood needs instantly.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
