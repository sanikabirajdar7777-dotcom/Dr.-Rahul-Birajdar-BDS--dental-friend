import React, { useState, useRef, useEffect } from 'react';
import SendIcon from './icons/SendIcon';

// Microphone Icon Component
const MicrophoneIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
  );
};

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
}

// Fix: Cast window to `any` to access browser-specific SpeechRecognition APIs not present in standard TypeScript DOM types.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  // Fix: Use `any` for the ref type to avoid a name clash with the 'SpeechRecognition' constant defined above.
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Process a single utterance
    recognition.interimResults = true; // Get results as they are recognized
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);


  const handleToggleListening = () => {
    if (isLoading || !isSpeechRecognitionSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput(''); // Clear input for new recording
      recognitionRef.current?.start();
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      if (isListening) {
        recognitionRef.current?.stop();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <footer className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask a dental question..."}
          disabled={isLoading}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-shadow"
        />
         <button
            type="button"
            onClick={handleToggleListening}
            disabled={isLoading || !isSpeechRecognitionSupported}
            className={`text-white rounded-full p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isSpeechRecognitionSupported ? (isListening ? 'Stop listening' : 'Start voice input') : 'Voice input not supported'}
          >
            <MicrophoneIcon />
        </button>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
        >
          <SendIcon />
        </button>
      </form>
    </footer>
  );
};

export default ChatInput;