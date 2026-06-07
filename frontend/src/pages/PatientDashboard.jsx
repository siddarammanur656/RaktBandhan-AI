import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { Activity, Clock, Users, History } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NextTransfusionCard from '@/components/patient/NextTransfusionCard';
import AssignedDonorCard from '@/components/patient/AssignedDonorCard';
import UpcomingSchedule from '@/components/patient/UpcomingSchedule';
import TransfusionHistory from '@/components/patient/TransfusionHistory';
import CreateRequestModal from '@/components/patient/CreateRequestModal';
import DashboardSkeleton from '@/components/layout/DashboardSkeleton';
import ProfileSettingsTab from '@/components/layout/ProfileSettingsTab';
import { UserCircle } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { nextTransfusion, assignedDonor, schedule, history, createRequest, loading } = usePatientData();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateRequest = async (formData) => {
    await createRequest({
      ...formData,
      patient_id: user.user_id,
    });
  };

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'donors', name: 'Donors', icon: Users },
    { id: 'history', name: 'History', icon: History },
    { id: 'profile', name: 'Profile Settings', icon: UserCircle },
  ];

  return (
    <DashboardLayout title="Patient Portal" navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab}>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">
                  Hello, <span className="text-brand-600">{user?.name?.split(' ')[0] || 'User'}</span> 👋
                </h1>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" /> Request Blood
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <NextTransfusionCard data={nextTransfusion} />
                  </div>
                  <div>
                    <AssignedDonorCard donor={assignedDonor} />
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                  <div>
                    <UpcomingSchedule schedule={schedule} />
                  </div>
                  <div>
                    <TransfusionHistory history={history} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-center mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">Schedule</h1>
              </div>
              <div>
                <UpcomingSchedule schedule={schedule} />
              </div>
            </div>
          )}

          {activeTab === 'donors' && (
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-center mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">Assigned Donors</h1>
              </div>
              <div>
                <AssignedDonorCard donor={assignedDonor} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-center mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">Transfusion History</h1>
              </div>
              <div>
                <TransfusionHistory history={history} />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileSettingsTab />
          )}
        </>
      )}

      <CreateRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequest}
        bloodGroup={user?.blood_group}
      />
    </DashboardLayout>
  );
}
