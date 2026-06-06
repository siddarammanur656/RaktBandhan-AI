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

export default function AdminDashboard() {
  const { user } = useAuth();
  const { kpis, activeRequests, donors, insights, askCoPilot } = useAdminData();
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'requests', name: 'Requests Manager', icon: Inbox },
    { id: 'donors', name: 'Donor Pool', icon: Users },
    { id: 'insights', name: 'AI Insights', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8.5rem)] w-full glass-card rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl border border-white/20 dark:border-white/10">
      {/* Sticky Sidebar */}
      <div className="w-full md:w-72 bg-sidebar/60 backdrop-blur-md border-r border-border p-6 shrink-0 flex flex-col h-auto md:h-full overflow-y-auto z-10 custom-scrollbar">
        <div className="mb-10 px-2 hidden md:block">
          <h2 className="text-2xl font-extrabold text-sidebar-foreground tracking-tight">Admin Portal</h2>
          <p className="text-sm font-medium text-sidebar-foreground/60 mt-1">{user?.name || 'Administrator'}</p>
        </div>
        <nav className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 flex-1">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap group ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary to-rose-500 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:-translate-y-0.5'
                }`}
              >
                <item.icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-sidebar-foreground/50 group-hover:text-primary'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-background/40 backdrop-blur-sm custom-scrollbar relative">
        <div className="max-w-6xl mx-auto pb-10">
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
                  <span className="text-base text-primary/80 font-bold mt-2 block uppercase tracking-widest">Powered by Claude 3</span>
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
        </div>
      </div>
    </div>
  );
}
