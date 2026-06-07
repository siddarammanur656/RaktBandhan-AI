import { HeartPulse, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const isBot = message.isBot;
  
  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-[85%] animate-fade-in-up ${isBot ? 'mr-auto' : 'ml-auto justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-gradient flex items-center justify-center mt-auto mb-1 shadow-sm">
          <HeartPulse className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div>
        <div className={`p-3.5 rounded-2xl shadow-sm ${
          isBot 
            ? 'bg-brand-gradient text-white rounded-bl-none' 
            : 'bg-[#F4F4F5] text-[#09090B] rounded-br-none border border-[#E4E4E7]'
        }`}>
          {isBot ? (
            <div className="text-sm font-medium leading-relaxed max-w-none text-white">
              <ReactMarkdown 
                components={{
                  strong: ({node, ...props}) => <span className="font-bold text-white" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm font-medium leading-relaxed">{message.text}</p>
          )}
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
