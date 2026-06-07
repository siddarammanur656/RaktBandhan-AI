import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDonorData } from '@/hooks/useDonorData';
import { Activity, Bell, History } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReliabilityScoreCard from '@/components/donor/ReliabilityScoreCard';
import NextEligibleDate from '@/components/donor/NextEligibleDate';
import PendingRequests from '@/components/donor/PendingRequests';
import DonationHistory from '@/components/donor/DonationHistory';
import DashboardSkeleton from '@/components/layout/DashboardSkeleton';
import ProfileSettingsTab from '@/components/layout/ProfileSettingsTab';
import { UserCircle } from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const { requests, history, score, tier, acceptRequest, declineRequest, loading } = useDonorData();
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'requests', name: 'Requests', icon: Bell },
    { id: 'history', name: 'History', icon: History },
    { id: 'profile', name: 'Profile Settings', icon: UserCircle },
  ];

  return (
    <DashboardLayout title="Donor Portal" navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab}>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">
                  Welcome back, <span className="text-brand-600">{user?.name?.split(' ')[0] || 'Hero'}</span> 👋
                </h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ReliabilityScoreCard score={score} tier={tier} />
                </div>
                <div>
                  <NextEligibleDate />
                </div>
              </div>

              <div>
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
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">Pending Requests</h1>
              </div>
              <div>
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
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B]">Donation History</h1>
              </div>
              <div>
                <DonationHistory history={history} />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileSettingsTab />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
