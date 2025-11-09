
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import LoadingSpinner from './LoadingSpinner';
import SuggestedQuestions from './SuggestedQuestions';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (input: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {messages.map((msg, index) => (
        <React.Fragment key={index}>
          <Message message={msg} />
          {index === messages.length - 1 &&
            msg.role === 'model' &&
            msg.suggestedQuestions &&
            msg.suggestedQuestions.length > 0 &&
            !isLoading && (
              <SuggestedQuestions
                questions={msg.suggestedQuestions}
                onQuestionClick={onSendMessage}
              />
            )}
        </React.Fragment>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center space-x-3 bg-gray-800 rounded-lg p-3 max-w-lg">
            <LoadingSpinner />
            <p className="text-gray-300 italic">Thinking...</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </main>
  );
};

export default ChatWindow;