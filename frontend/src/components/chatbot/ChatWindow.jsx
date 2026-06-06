import { useState, useRef, useEffect } from 'react';
import { X, Send, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatbot } from '@/hooks/useChatbot';
import { useAuth } from '@/hooks/useAuth';
import ChatMessage from './ChatMessage';

export default function ChatWindow({ onClose }) {
  const { messages, isTyping, sendMessage } = useChatbot();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const role = user?.role || 'donor';
  
  const rolePrompts = {
    admin: [
      "Show me active requests",
      "How many donors are eligible?",
      "Generate daily report"
    ],
    donor: [
      "Am I eligible to donate?",
      "Where is the nearest hospital?",
      "Update my location"
    ],
    patient: [
      "When is my next transfusion?",
      "How to request blood?",
      "I have an emergency"
    ]
  };

  const quickPrompts = rolePrompts[role] || rolePrompts.donor;

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
    <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[80vh] glass-card rounded-3xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-rose-500 text-primary-foreground p-5 flex justify-between items-center shadow-md z-10">
        <div>
          <h3 className="font-extrabold flex items-center gap-2 text-lg">
            <HeartPulse className="h-5 w-5 animate-pulse-slow" />
            RaktBandhan AI
          </h3>
          <p className="text-xs text-primary-foreground/80 flex items-center gap-1.5 mt-1 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(7ade80,0.8)]"></span> Online
          </p>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-colors" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto bg-background/50 flex flex-col" ref={scrollRef}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex w-full mt-4 space-x-3 max-w-[85%] mr-auto items-end animate-fade-in">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1 border border-primary/20">
              <span className="h-5 w-5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </span>
            </div>
            <div className="p-3 bg-muted rounded-2xl rounded-bl-none shadow-sm border border-border/50">
              <p className="text-sm text-muted-foreground italic font-medium">Claude is thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx} 
                onClick={() => handlePromptClick(prompt)}
                className="whitespace-nowrap px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
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
            className="flex-1 rounded-full bg-input/50 border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0 px-5 h-12 shadow-inner"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-md transition-transform active:scale-95">
            <Send className="h-5 w-5 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
