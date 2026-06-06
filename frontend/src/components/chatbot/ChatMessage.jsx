import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isBot = message.isBot;
  
  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mt-auto mb-1">
          <Bot className="h-5 w-5 text-red-600" />
        </div>
      )}
      
      <div>
        <div className={`p-3 rounded-2xl ${isBot ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-red-600 text-white rounded-br-none'}`}>
          <p className="text-sm">{message.text}</p>
        </div>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mt-auto mb-1">
          <User className="h-5 w-5 text-gray-600" />
        </div>
      )}
    </div>
  );
}
