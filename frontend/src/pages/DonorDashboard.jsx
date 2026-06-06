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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here is your donor summary for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReliabilityScoreCard score={score} tier={tier} />
        <NextEligibleDate />
      </div>

      <PendingRequests 
        requests={requests} 
        onAccept={acceptRequest} 
        onDecline={declineRequest} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DonationHistory history={history} />
        {/* Placeholder for future features like Chatbot trigger or AI insights */}
      </div>
    </div>
  );
}
