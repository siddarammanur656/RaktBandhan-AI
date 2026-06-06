import { HeartPulse, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isBot = message.isBot;
  
  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-[85%] animate-fade-in-up ${isBot ? 'mr-auto' : 'ml-auto justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-auto mb-1 shadow-sm">
          <HeartPulse className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div>
        <div className={`p-3.5 rounded-2xl shadow-sm border ${
          isBot 
            ? 'bg-card text-card-foreground rounded-bl-none border-border/50' 
            : 'bg-gradient-to-r from-primary to-rose-500 text-primary-foreground rounded-br-none border-transparent'
        }`}>
          <p className="text-sm font-medium leading-relaxed">{message.text}</p>
        </div>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center mt-auto mb-1 shadow-sm">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
