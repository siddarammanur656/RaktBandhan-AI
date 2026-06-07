import { useAuth } from '@/hooks/useAuth';
import { Search, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout({ title, navigation, activeTab, setActiveTab, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotification = () => {
    toast.info('You have no new notifications');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-white overflow-hidden">
      {/* Sidebar - Linear.app Style */}
      <div className="w-full md:w-64 bg-white border-r border-[#F4F4F5] p-4 shrink-0 flex flex-col h-auto md:h-full overflow-y-auto z-20">
        <div className="mb-8 px-2 hidden md:flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-brand-gradient flex items-center justify-center shadow-brand">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
          </div>
          <h2 className="text-lg font-display font-bold text-[#09090B] tracking-tight">RaktBandhan AI</h2>
        </div>
        
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 flex-1">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap group ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600 shadow-[inset_2px_0_0_0_#DC2626]' 
                    : 'text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#18181B]'
                }`}
              >
                <item.icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-brand-600' : 'text-[#A1A1AA] group-hover:text-[#52525B]'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-[#F4F4F5] px-2 hidden md:block group relative">
          <div className="flex justify-between items-center px-2 py-2 rounded-lg hover:bg-[#F4F4F5] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-600">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-[#09090B] truncate">{user?.name || 'User'}</span>
                <span className="text-xs text-[#A1A1AA] truncate capitalize">{user?.role || 'Guest'}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-[#A1A1AA] hover:text-brand-600 transition-colors p-1 rounded-md"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#FAFAFA]">
        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-[#F4F4F5] shrink-0 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-display font-semibold text-[#09090B] tracking-tight">{title}</h1>
          
          <div className="flex items-center gap-4">
             <div className="relative hidden lg:block w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                <Input placeholder="Search..." className="pl-9 h-9 rounded-lg bg-[#FAFAFA] border-transparent focus-visible:bg-white focus-visible:border-brand-500" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                   <kbd className="inline-flex h-5 items-center gap-1 rounded border border-[#E4E4E7] bg-white px-1.5 font-mono text-[10px] font-medium text-[#A1A1AA]">
                     <span className="text-xs">⌘</span>K
                   </kbd>
                </div>
             </div>
             
             <button 
               onClick={handleNotification}
               className="relative p-2 text-[#52525B] hover:bg-[#F4F4F5] rounded-full transition-colors"
             >
               <Bell className="h-5 w-5" />
               <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
