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
      else if (res.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      toast.error(res.error || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 min-h-screen">
      <div className="w-full max-w-xl p-8 space-y-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10">
        <h2 className="text-3xl font-extrabold text-center text-foreground tracking-tight">Join <span className="text-gradient">RaktBandhan</span></h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Button type="submit" className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90 shadow-lg hover:shadow-primary/25 transition-all duration-300" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Create Account'}
          </Button>
        </form>
        <p className="text-center text-sm font-medium text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:text-rose-500 hover:underline transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
}
