import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'donor',
    blood_group: '',
    gender: '',
    city: ''
  });
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      return toast.error('Please fill all required fields');
    }

    const res = await register(formData);
    if (res.success) {
      toast.success('Registration successful!');
      if (res.user.role === 'patient') navigate('/patient/dashboard');
      else if (res.user.role === 'donor') navigate('/donor/dashboard');
      else if (res.user.role === 'hospital') navigate('/hospital/dashboard');
      else if (res.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      toast.error(res.error || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] md:min-h-screen w-full bg-white animate-fade-in overflow-hidden -mt-28 md:mt-0 relative z-50">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:flex-none lg:w-[60%] lg:px-20 xl:px-24 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-8">
            <div className="h-10 w-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand mb-6">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
            </div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-[#09090B]">Create an account</h2>
            <p className="mt-2 text-sm text-[#52525B]">
              Join the RaktBandhan network and start saving lives today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="Rahul Kumar" value={formData.name} onChange={handleChange} disabled={isLoading} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={isLoading} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} disabled={isLoading} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} disabled={isLoading} required />
              </div>

              <div className="space-y-2">
                <Label>I am a... *</Label>
                <Select value={formData.role} onValueChange={(val) => handleSelectChange('role', val)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Blood Donor</SelectItem>
                    <SelectItem value="patient">Thalassemia Patient</SelectItem>
                    <SelectItem value="hospital">Hospital / Blood Bank</SelectItem>
                    <SelectItem value="admin">Blood Warriors Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={formData.blood_group} onValueChange={(val) => handleSelectChange('blood_group', val)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City / Area</Label>
                <Input id="city" placeholder="e.g. Mumbai" value={formData.city} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>
            
            <div className="space-y-3 pt-2 border-t border-[#F4F4F5] mt-6">
              <Button type="button" variant="outline" className="w-full text-brand-600 border-[#E4E4E7] hover:bg-[#FEF2F2] hover:text-brand-700" onClick={() => {
                if (navigator.geolocation) {
                  toast.info("Detecting location...");
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                      }));
                      toast.success("Location detected successfully!");
                    },
                    (error) => {
                      toast.error("Could not get location. Please allow location permissions.");
                    }
                  );
                } else {
                  toast.error("Geolocation is not supported by your browser");
                }
              }}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Detect My Precise Location
              </Button>
              {formData.latitude && formData.longitude && (
                <p className="text-xs text-green-600 font-medium text-center">
                  ✓ Location saved: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Create Account'}
              </Button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[#F4F4F5]">
            <p className="text-center text-sm font-medium text-[#52525B]">
              Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-500 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-[40%] bg-brand-gradient">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
           <div className="max-w-lg space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium shadow-lg">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                Join the Network
             </div>
             <h1 className="text-5xl font-display font-bold tracking-tight leading-[1.1]">Become a Blood Warrior today.</h1>
             <p className="text-lg text-white/80 leading-relaxed font-medium">
               Whether you need blood or want to donate, our AI ensures the right connection happens at the right time.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
