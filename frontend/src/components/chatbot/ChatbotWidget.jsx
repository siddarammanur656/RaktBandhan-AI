import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useAuth } from '@/hooks/useAuth';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Only show for Donors and Patients, hide for Admin
  if (!user || user.role === 'admin') return null;

  return (
    <>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 hover:shadow-xl z-50 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          <MessageSquareText className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
