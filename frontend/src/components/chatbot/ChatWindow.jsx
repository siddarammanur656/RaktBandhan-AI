import { useState, useRef, useEffect } from 'react';
import { X, Send, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatbot } from '@/hooks/useChatbot';
import ChatMessage from './ChatMessage';

export default function ChatWindow({ onClose }) {
  const { messages, isTyping, sendMessage } = useChatbot();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const quickPrompts = [
    "Am I eligible to donate?",
    "Where is the nearest hospital?",
    "I have an emergency"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt) => {
    if (isTyping) return;
    sendMessage(prompt);
  };

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            RaktBandhan AI
          </h3>
          <p className="text-xs text-red-100 flex items-center gap-1 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-green-400"></span> Online
          </p>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-red-700 hover:text-white" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col" ref={scrollRef}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex w-full mt-4 space-x-3 max-w-[85%] mr-auto items-end">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
              <span className="h-5 w-5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </span>
            </div>
            <div className="p-3 bg-gray-200 rounded-2xl rounded-bl-none">
              <p className="text-sm text-gray-500 italic">typing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100">
        {/* Quick Prompts - Only show if it's the start of the chat to keep UI clean */}
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx} 
                onClick={() => handlePromptClick(prompt)}
                className="whitespace-nowrap px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-medium hover:bg-red-100 hover:border-red-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask RaktBandhan AI..." 
            className="flex-1 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-red-500 focus-visible:ring-offset-0 px-4"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-sm transition-transform active:scale-95">
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
