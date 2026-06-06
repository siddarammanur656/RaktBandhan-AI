import { useAuth } from '@/hooks/useAuth';
import { useDonorData } from '@/hooks/useDonorData';
import ReliabilityScoreCard from '@/components/donor/ReliabilityScoreCard';
import NextEligibleDate from '@/components/donor/NextEligibleDate';
import PendingRequests from '@/components/donor/PendingRequests';
import DonationHistory from '@/components/donor/DonationHistory';

export default function DonorDashboard() {
  const { user } = useAuth();
  const { requests, history, score, tier, acceptRequest, declineRequest } = useDonorData();

  return (
    <div className="space-y-8 pb-12">
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          Welcome back, <span className="text-gradient">{user?.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Your heroic impact dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-fade-in-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
          <ReliabilityScoreCard score={score} tier={tier} />
        </div>
        <div className="animate-fade-in-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
          <NextEligibleDate />
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <PendingRequests 
          requests={requests} 
          onAccept={acceptRequest} 
          onDecline={declineRequest} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="hover:-translate-y-1 transition-transform duration-300">
          <DonationHistory history={history} />
        </div>
      </div>
    </div>
  );
}
