import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import NextTransfusionCard from '@/components/patient/NextTransfusionCard';
import AssignedDonorCard from '@/components/patient/AssignedDonorCard';
import UpcomingSchedule from '@/components/patient/UpcomingSchedule';
import TransfusionHistory from '@/components/patient/TransfusionHistory';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { nextTransfusion, assignedDonor, schedule, history } = usePatientData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here is your upcoming schedule and donor information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Priority Items */}
        <div className="lg:col-span-2 space-y-6">
          <NextTransfusionCard data={nextTransfusion} />
          <AssignedDonorCard donor={assignedDonor} />
        </div>

        {/* Right Column - Secondary Items */}
        <div className="lg:col-span-1 space-y-6">
          <UpcomingSchedule schedule={schedule} />
          <TransfusionHistory history={history} />
        </div>
      </div>
    </div>
  );
}
