import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDonorData } from '@/hooks/useDonorData';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';
import ReliabilityScoreCard from '@/components/donor/ReliabilityScoreCard';

export default function DonorProfile() {
  const { user } = useAuth();
  const { score, tier } = useDonorData();
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`rb_donor_location_${user?.user_id}`);
    if (saved) setLocation(JSON.parse(saved));
  }, [user]);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        setLocation({ lat, lng });
        toast.success('Location updated successfully!');
        setIsUpdatingLocation(false);
        localStorage.setItem(`rb_donor_location_${user?.user_id}`, JSON.stringify({ lat, lng }));
      },
      (error) => {
        toast.error('Unable to retrieve your location. Please check browser permissions.');
        setIsUpdatingLocation(false);
      }
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-gray-900">Donor Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <ReliabilityScoreCard score={score} tier={tier} />
          
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Settings</h3>
            <p className="text-sm text-gray-500 mb-4">
              Keep your location updated to receive the most urgent blood requests near you.
            </p>
            {location && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm text-gray-700 flex items-center gap-2 border border-gray-200">
                <MapPin className="h-4 w-4 text-red-600" />
                {location.lat}, {location.lng}
              </div>
            )}
            <Button onClick={handleUpdateLocation} disabled={isUpdatingLocation} variant="outline" className="w-full">
              {isUpdatingLocation ? 'Locating...' : 'Update Current Location'}
            </Button>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Profile saved!'); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood">Blood Group</Label>
                  <Input id="blood" defaultValue="B+" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+91 9876543210" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="bg-red-600 hover:bg-red-700 gap-2">
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
