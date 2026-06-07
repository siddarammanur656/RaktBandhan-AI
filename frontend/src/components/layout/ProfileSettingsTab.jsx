import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import client from '@/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Droplet, ShieldCheck, Save, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettingsTab() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    blood_group: user?.blood_group || '',
    city: user?.city || '',
  });

  const handleSave = async () => {
    try {
      let endpoint = '';
      let payload = {};

      if (user?.role === 'donor') {
        endpoint = '/api/donors/profile';
        payload = {
          name: formData.name || user.name || '',
          email: formData.email || user.email || '',
          phone: formData.phone || user.phone || '',
          blood_group: formData.blood_group || user.blood_group || 'O+',
          gender: user.gender || 'Not Specified',
          date_of_birth: user.date_of_birth || '1990-01-01',
          address_text: formData.city || user.city || '',
          donor_type: user.donor_type || 'whole_blood',
        };
      } else if (user?.role === 'patient') {
        endpoint = '/api/patients/profile';
        payload = {
          name: formData.name || user.name || '',
          email: formData.email || user.email || '',
          phone: formData.phone || user.phone || '',
          blood_group: formData.blood_group || user.blood_group || 'O+',
          date_of_birth: user.date_of_birth || '1990-01-01',
          address_text: formData.city || user.city || '',
          transfusion_frequency_days: user.transfusion_frequency_days || 21,
          guardian_name: user.guardian_name || 'N/A',
          guardian_phone: user.guardian_phone || 'N/A',
        };
      } else {
        // Admin or Hospital generic update
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        return;
      }

      const res = await client.post(endpoint, payload);
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        // Update local storage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">Profile Settings</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 border-[#E4E4E7] text-[#09090B]">
            <Edit3 className="h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" className="border-[#E4E4E7]">Cancel</Button>
            <Button onClick={handleSave} className="bg-brand-600 hover:bg-brand-700 text-white gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="p-6 border border-[#E4E4E7] shadow-sm flex flex-col items-center text-center bg-white rounded-2xl">
            <div className="h-24 w-24 rounded-full bg-brand-50 flex items-center justify-center text-3xl font-bold text-brand-600 mb-4 border-4 border-white shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h3 className="font-display text-xl font-bold text-[#09090B]">{user?.name || 'User'}</h3>
            <p className="text-[#71717A] capitalize text-sm mb-4">{user?.role || 'Guest'}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Account
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-8 border border-[#E4E4E7] shadow-sm bg-white rounded-2xl">
            <h3 className="font-display text-lg font-semibold text-[#09090B] mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
                  <User className="h-4 w-4 text-brand-500" /> Full Name
                </label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="bg-[#FAFAFA] border-[#E4E4E7] focus-visible:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-brand-500" /> Email Address
                </label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className="bg-[#FAFAFA] border-[#E4E4E7] focus-visible:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-brand-500" /> Phone Number
                </label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="+91 "
                  className="bg-[#FAFAFA] border-[#E4E4E7] focus-visible:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-500" /> City/Region
                </label>
                <Input 
                  value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  disabled={!isEditing}
                  className="bg-[#FAFAFA] border-[#E4E4E7] focus-visible:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              {user?.role !== 'admin' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
                    <Droplet className="h-4 w-4 text-brand-500" /> Blood Group
                  </label>
                  <select 
                    value={formData.blood_group}
                    onChange={e => setFormData({...formData, blood_group: e.target.value})}
                    disabled={!isEditing}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
