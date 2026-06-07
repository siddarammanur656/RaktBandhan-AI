import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/sonner';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function Layout() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const isAuth = location.pathname.includes('/login') || location.pathname.includes('/register');

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {!isDashboard && !isAuth && <Navbar />}
      <main className={`flex-grow ${isDashboard || isAuth ? 'p-0 w-full max-w-none' : 'container mx-auto px-4 pt-28 pb-12 max-w-7xl'} relative z-10`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <ChatbotWidget />
      <Toaster position="top-center" richColors />
      
      {/* Decorative background blobs */}
      {!isDashboard && !isAuth && (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40 mix-blend-multiply">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-100 blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-brand-50 blur-[150px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
      )}
    </div>
  );
}
