import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/sonner';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-7xl animate-fade-in relative z-10">
        <Outlet />
      </main>
      <ChatbotWidget />
      <Toaster position="top-center" richColors />
      
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-rose-400/20 blur-[150px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}
