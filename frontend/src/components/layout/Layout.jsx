import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/sonner';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
      <ChatbotWidget />
      <Toaster position="top-center" />
    </div>
  );
}
