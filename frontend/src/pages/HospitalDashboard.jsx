import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, Activity, PlusCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NumberFlow from '@number-flow/react';
import { Button } from '@/components/ui/button';
import DashboardSkeleton from '@/components/layout/DashboardSkeleton';
import client from '@/api/client';
import { toast } from 'sonner';
import ProfileSettingsTab from '@/components/layout/ProfileSettingsTab';
import { UserCircle } from 'lucide-react';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigation = [
    { id: 'overview', name: 'Hospital Dashboard', icon: LayoutDashboard },
    { id: 'profile', name: 'Profile Settings', icon: UserCircle },
  ];

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // In a real app, we'd have a specific endpoint or filter for hospital requests. 
      // For the hackathon, we can fetch all requests and filter by patient_id = hospital's user_id
      const res = await client.get(`/api/admin/dashboard`); // Hack: reuse admin dashboard to get requests
      // Alternatively, we could create an endpoint, but since we are reusing CreateRequestModal, 
      // we'll just optimistically update the state.
      setHospitalRequests([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (formData) => {
    try {
      const payload = {
        ...formData,
        patient_id: user.user_id, // Link to hospital
      };
      
      // If we had a patient_name in formData we could use it, 
      // but CreateRequestModal puts extra info in `notes` or `address_text`.
      
      const res = await client.post('/api/requests', payload);
      toast.success("Emergency request created and donors notified!");
      
      // Optimistic update
      setHospitalRequests(prev => [{
        id: res.data.data.request_id,
        patient: `Hospital: ${user.name}`,
        bloodGroup: formData.blood_group,
        units: formData.quantity_units,
        status: 'matching',
        location: formData.address_text,
        date: new Date().toISOString().split('T')[0]
      }, ...prev]);
      
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create request");
    }
  };

  return (
    <DashboardLayout title={`${user?.name || 'Hospital'} Portal`} navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab}>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">Emergency Command Center</h1>
              <p className="text-[#71717A] mt-2">Manage blood requests for critical patients in your facility.</p>
            </div>
            <Button 
              onClick={() => setIsRequestModalOpen(true)} 
              className="flex items-center gap-2"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Emergency Request
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-[#71717A] mb-1">Active Requests</h3>
              <p className="font-display text-4xl font-bold tracking-tight text-[#09090B]">
                 <NumberFlow value={hospitalRequests.length} />
              </p>
            </div>
            <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-[#71717A] mb-1">Units Needed Today</h3>
              <p className="font-display text-4xl font-bold tracking-tight text-[#09090B]">
                 <NumberFlow value={hospitalRequests.reduce((sum, req) => sum + req.units, 0)} />
              </p>
            </div>
            <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-[#71717A] mb-1">Status</h3>
              <p className="font-display text-2xl font-bold text-green-600 flex items-center gap-3 mt-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                AI Matching Online
              </p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mt-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#09090B] mb-6">Recent Facility Requests</h2>
            {hospitalRequests.length > 0 ? (
              <ActiveRequestsTable requests={hospitalRequests} />
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-border shadow-sm">
                <Activity className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-semibold mb-2 text-[#09090B]">No Active Requests</h3>
                <p className="text-[#71717A] max-w-sm mx-auto mt-2">
                  When you create emergency blood requests for your patients, they will appear here and AI will automatically find donors.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'profile' && !isLoading && (
        <ProfileSettingsTab />
      )}

      <CreateRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </DashboardLayout>
  );
}
