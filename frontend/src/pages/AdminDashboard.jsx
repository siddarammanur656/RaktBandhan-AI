import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { LayoutDashboard, Users, Inbox, Sparkles } from 'lucide-react';
import KPICards from '@/components/admin/KPICards';
import ActiveRequestsTable from '@/components/admin/ActiveRequestsTable';
import EscalationsAlert from '@/components/admin/EscalationsAlert';
import DonorPoolAnalytics from '@/components/admin/DonorPoolAnalytics';
import AIInsightsPanel from '@/components/admin/AIInsightsPanel';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { kpis, activeRequests, donors, insights } = useAdminData();
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'requests', name: 'Requests Manager', icon: Inbox },
    { id: 'donors', name: 'Donor Pool', icon: Users },
    { id: 'insights', name: 'AI Insights', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 shrink-0">
        <div className="mb-8 px-4 hidden md:block">
          <h2 className="text-xl font-bold text-gray-900">Admin Portal</h2>
          <p className="text-sm text-gray-500">{user?.name}</p>
        </div>
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
              </div>
              <EscalationsAlert count={kpis.escalations} />
              <KPICards kpis={kpis} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Requests</h3>
                  <ActiveRequestsTable requests={activeRequests.slice(0, 3)} />
                </div>
                <div className="lg:col-span-1">
                  <AIInsightsPanel insights={insights} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Requests Manager</h1>
              </div>
              <ActiveRequestsTable requests={activeRequests} />
            </div>
          )}

          {activeTab === 'donors' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Donor Pool Analytics</h1>
              </div>
              <DonorPoolAnalytics donors={donors} />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Co-Pilot</h1>
                  <span className="text-sm text-gray-500 mt-1 block">Powered by Bedrock</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AIInsightsPanel insights={insights} />
                
                {/* Placeholder for query interface */}
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Language Querying</h3>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Ask questions like "Which areas have the lowest auto-fulfillment rate today?"
                    <br/><br/>
                    (Coming in Phase 7)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
