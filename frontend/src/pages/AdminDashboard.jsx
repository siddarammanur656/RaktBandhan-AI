import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { LayoutDashboard, Users, Inbox, Sparkles } from 'lucide-react';
import KPICards from '@/components/admin/KPICards';
import ActiveRequestsTable from '@/components/admin/ActiveRequestsTable';
import EscalationsAlert from '@/components/admin/EscalationsAlert';
import DonorPoolAnalytics from '@/components/admin/DonorPoolAnalytics';
import AIInsightsPanel from '@/components/admin/AIInsightsPanel';
import AdminCoPilotQuery from '@/components/admin/AdminCoPilotQuery';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminDashboard() {
  const { kpis, activeRequests, donors, insights, askCoPilot } = useAdminData();
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'requests', name: 'Requests Manager', icon: Inbox },
    { id: 'donors', name: 'Donor Pool', icon: Users },
    { id: 'insights', name: 'AI Insights', icon: Sparkles },
  ];

  return (
    <DashboardLayout title="Admin Portal" navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Platform Overview</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <EscalationsAlert count={kpis.escalations} />
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <KPICards kpis={kpis} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Recent Requests</h3>
              <ActiveRequestsTable requests={activeRequests.slice(0, 3)} />
            </div>
            <div className="lg:col-span-1 hover:-translate-y-1 transition-transform duration-300">
              <AIInsightsPanel insights={insights} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Requests Manager</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <ActiveRequestsTable requests={activeRequests} />
          </div>
        </div>
      )}

      {activeTab === 'donors' && (
        <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Donor Pool Analytics</h1>
          </div>
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <DonorPoolAnalytics donors={donors} />
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3 tracking-tight">
                <Sparkles className="h-10 w-10 text-primary animate-pulse-slow" />
                <span className="text-gradient">AI Co-Pilot</span>
              </h1>
              <span className="text-base text-primary/80 font-bold mt-2 block uppercase tracking-widest">Powered by Claude</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            <div className="hover:-translate-y-1 transition-transform duration-300">
              <AIInsightsPanel insights={insights} />
            </div>
            <div className="hover:-translate-y-1 transition-transform duration-300 relative z-50">
              <AdminCoPilotQuery onAsk={askCoPilot} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
