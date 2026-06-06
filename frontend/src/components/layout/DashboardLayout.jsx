import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ title, navigation, activeTab, setActiveTab, children }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] md:h-[calc(100vh-8.5rem)] w-full glass-card rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl border border-white/20 dark:border-white/10 mt-6">
      {/* Sticky Sidebar */}
      <div className="w-full md:w-72 bg-sidebar/60 backdrop-blur-md border-r border-border p-6 shrink-0 flex flex-col h-auto md:h-full overflow-y-auto z-10 custom-scrollbar">
        <div className="mb-10 px-2 hidden md:block">
          <h2 className="text-2xl font-extrabold text-sidebar-foreground tracking-tight">{title}</h2>
          <p className="text-sm font-medium text-sidebar-foreground/60 mt-1">{user?.name || 'User'}</p>
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
          {children}
        </div>
      </div>
    </div>
  );
}
