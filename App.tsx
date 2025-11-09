import React, { useState, useEffect } from 'react';
import { ChatMessage } from './types';
import { generateResponse } from './services/geminiService';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import NewChatIcon from './components/icons/NewChatIcon';

const CHAT_HISTORY_KEY = 'chatHistory';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initialMessage: ChatMessage = {
    role: 'model',
    content: "Hello! I'm Dr. Rahul Birajdar (BDS), your friendly dental specialist. I can explain everything from daily brushing to more complex dental procedures, and even draw diagrams to make things clearer. How can I help you with your oral health today?",
  };

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedMessages && JSON.parse(savedMessages).length > 0) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([initialMessage]);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setMessages([initialMessage]);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    // We only save if there's more than the initial welcome message
    if (messages.length > 1) {
      try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } catch (err) {
        console.error("Failed to save chat history:", err);
      }
    }
  }, [messages]);

  const handleSendMessage = async (userInput: string) => {
    if (isLoading || !userInput.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    try {
      const modelMessage = await generateResponse(currentMessages);
      setMessages((prevMessages) => [...prevMessages, modelMessage]);
    } catch (e) {
      const errorMessage = 'Oops! My dental tools seem to be malfunctioning. I couldn\'t get a response. Maybe try asking in a different way?';
      setError(errorMessage);
      setMessages((prevMessages) => [...prevMessages, { role: 'model', content: errorMessage }]);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewChat = () => {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }
    setMessages([initialMessage]);
    setError(null);
  };


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
              👨‍⚕️
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dr. Rahul Birajdar, BDS - Dental Specialist</h1>
              <div className="flex items-center space-x-3 mt-1">
                <a 
                  href="https://ai.google.dev/gemini-api/docs/models/gemini#gemini-2.5-flash-image"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-300 hover:text-purple-200 hover:underline"
                >
                  Powered by Gemini 2.5 Flash Image
                </a>
                <span className="text-gray-500">|</span>
                <a 
                  href="https://github.com/google/gemini-api-cookbook/tree/main/demos/young-scientist-chatbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-300 hover:text-purple-200 hover:underline flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  View Project
                </a>
              </div>
            </div>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 border border-gray-600 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          title="Start a new chat"
        >
          <NewChatIcon />
          New Chat
        </button>
      </header>
      
      <ChatWindow messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} />

      {error && (
        <div className="px-4 py-2 text-red-400 bg-red-900/50 text-center text-sm">
          {error}
        </div>
      )}

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;