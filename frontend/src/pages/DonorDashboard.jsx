import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDonorData } from '@/hooks/useDonorData';
import { Activity, Bell, History } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReliabilityScoreCard from '@/components/donor/ReliabilityScoreCard';
import NextEligibleDate from '@/components/donor/NextEligibleDate';
import PendingRequests from '@/components/donor/PendingRequests';
import DonationHistory from '@/components/donor/DonationHistory';

export default function DonorDashboard() {
  const { user } = useAuth();
  const { requests, history, score, tier, acceptRequest, declineRequest } = useDonorData();
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'requests', name: 'Requests', icon: Bell },
    { id: 'history', name: 'History', icon: History },
  ];

  return (
    <DashboardLayout title="Donor Portal" navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Hero'}</span> 👋
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hover:-translate-y-1 transition-transform duration-300">
              <ReliabilityScoreCard score={score} tier={tier} />
            </div>
            <div className="hover:-translate-y-1 transition-transform duration-300">
              <NextEligibleDate />
            </div>
          </div>

          <div className="hover:-translate-y-1 transition-transform duration-300">
            <PendingRequests 
              requests={requests.slice(0, 3)} 
              onAccept={acceptRequest} 
              onDecline={declineRequest} 
            />
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Pending Requests</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <PendingRequests 
              requests={requests} 
              onAccept={acceptRequest} 
              onDecline={declineRequest} 
            />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Donation History</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <DonationHistory history={history} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
