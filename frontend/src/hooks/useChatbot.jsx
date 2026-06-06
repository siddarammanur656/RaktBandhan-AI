import { useState } from 'react';

export function useChatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi, I am RaktBandhan AI. How can I help you today?", isBot: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text) => {
    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "I'm sorry, I don't have information on that right now. Please contact support if it's urgent.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('eligible') || lowerText.includes('can i donate')) {
        botResponse = "To be eligible to donate, you generally need to be at least 18 years old, weigh at least 50 kg, and be in good health. If you had a tattoo or major surgery recently, you may need to wait 6 months.";
      } else if (lowerText.includes('hospital') || lowerText.includes('nearest')) {
        botResponse = "Your nearest partner hospital is Apollo Hospitals, located 2.1 km away. They are open 24/7 for emergency blood requests.";
      } else if (lowerText.includes('urgent') || lowerText.includes('emergency')) {
        botResponse = "If this is a medical emergency, please call the local emergency number immediately. If you need blood urgently, navigate to the 'Request Blood' section.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, isBot: true }]);
      setIsTyping(false);
    }, 1500);
  };

  return { messages, isTyping, sendMessage };
}
