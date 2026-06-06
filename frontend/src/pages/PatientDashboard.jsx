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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          Hello, <span className="text-gradient">{user?.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Your health journey and upcoming schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Priority Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="animate-fade-in-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
            <NextTransfusionCard data={nextTransfusion} />
          </div>
          <div className="animate-fade-in-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
            <AssignedDonorCard donor={assignedDonor} />
          </div>
        </div>

        {/* Right Column - Secondary Items */}
        <div className="lg:col-span-1 space-y-8">
          <div className="animate-fade-in-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '0.4s' }}>
            <UpcomingSchedule schedule={schedule} />
          </div>
          <div className="animate-fade-in-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '0.5s' }}>
            <TransfusionHistory history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
