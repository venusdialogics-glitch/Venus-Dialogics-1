import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Topic } from '../types';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

interface ChatAssistantProps {
  topics: Topic[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ topics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, my connection is currently unavailable (API Key missing)." }]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const topicList = topics.map(t => `- ${t.title}: ${t.description}`).join('\n');
      const systemInstruction = `
        You are the AI Assistant for VENUS Dialogics and Training Unlimited, representing Mr. Roel Venus.
        
        Your STRICT goal is to assist users ONLY with the following training topics:
        ${topicList}
        
        Rules:
        1. If a user asks about these topics, provide helpful, professional summaries and encourage them to book a schedule.
        2. If a user asks about anything else (e.g., cooking, coding, general news), politely decline and steer them back to Mr. Venus's training services.
        3. Be professional, concise, and enthusiastic.
        4. Do not make up facts about Mr. Venus outside of provided context.
      `;

      // Use generateContent with system instruction in config
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const text = response.text || "I apologize, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered a temporary error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-venus-900 text-white p-4 rounded-full shadow-lg hover:bg-venus-800 transition-all ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-venus-900 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">Venus Assistant</h3>
              <p className="text-xs text-venus-100">Ask about our topics</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">
                <p>Hello! I can answer questions about Mr. Roel Venus's speaking topics.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-venus-500 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                  <Loader2 className="animate-spin text-venus-500" size={16} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your question..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-venus-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-venus-900 text-white p-2 rounded-lg hover:bg-venus-800 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
