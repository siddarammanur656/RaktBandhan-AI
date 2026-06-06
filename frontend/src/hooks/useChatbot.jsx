import { useState } from 'react';
import client from '../api/client';
import { toast } from 'sonner';

export function useChatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi, I am RaktBandhan AI. How can I help you today?", isBot: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(`sess_${Date.now()}`);

  const sendMessage = async (text) => {
    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await client.post('/api/chat/message', {
        message: text,
        session_id: sessionId
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: response.data.data.response, 
          isBot: true 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "I'm sorry, I am having trouble connecting to the server. Please try again later.", 
        isBot: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, sendMessage };
}
