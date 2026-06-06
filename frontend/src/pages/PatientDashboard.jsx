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

export default function PatientDashboard() {
  const { user } = useAuth();
  const { nextTransfusion, assignedDonor, schedule, history, createRequest } = usePatientData();
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
  ];

  return (
    <DashboardLayout title="Patient Portal" navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
              Hello, <span className="text-gradient">{user?.name?.split(' ')[0] || 'User'}</span> 👋
            </h1>
            <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center gap-2 px-6 h-12 text-md font-semibold">
              <PlusCircle className="h-5 w-5" /> Request Blood
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="hover:-translate-y-1 transition-transform duration-300">
                <NextTransfusionCard data={nextTransfusion} />
              </div>
              <div className="hover:-translate-y-1 transition-transform duration-300">
                <AssignedDonorCard donor={assignedDonor} />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <div className="hover:-translate-y-1 transition-transform duration-300">
                <UpcomingSchedule schedule={schedule} />
              </div>
              <div className="hover:-translate-y-1 transition-transform duration-300">
                <TransfusionHistory history={history} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Schedule</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <UpcomingSchedule schedule={schedule} />
          </div>
        </div>
      )}

      {activeTab === 'donors' && (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Assigned Donors</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <AssignedDonorCard donor={assignedDonor} />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Transfusion History</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <TransfusionHistory history={history} />
          </div>
        </div>
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
