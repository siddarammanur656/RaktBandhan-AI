import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useAuth } from '@/hooks/useAuth';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Show for all logged in users
  if (!user) return null;

  return (
    <>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-brand-gradient text-white rounded-full shadow-brand flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg z-50 focus:outline-none animate-pulse-slow group"
        >
          <MessageSquareText className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </>
  );
}
