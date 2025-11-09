import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChatMessage } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import ZoomIcon from './icons/ZoomIcon';
import CloseIcon from './icons/CloseIcon';


interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);


  const isUser = message.role === 'user';
  const messageClasses = isUser
    ? 'bg-blue-600 self-end rounded-br-none'
    : 'bg-gray-800 self-start rounded-bl-none';
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <>
      <div className={`flex ${containerClasses}`}>
        <div className={`flex items-start gap-3 max-w-xl`}>
          {!isUser && (
            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-lg flex-shrink-0">
              👨‍⚕️
            </div>
          )}
          <div className={`px-4 py-3 rounded-2xl text-white ${messageClasses}`}>
            {message.imageUrl && (
              <div className="relative group mb-2">
                <img
                  src={message.imageUrl}
                  alt="Generated dental diagram"
                  className="rounded-lg border border-gray-700 max-w-full h-auto cursor-zoom-in"
                  onClick={() => setIsModalOpen(true)}
                />
                 <div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg cursor-zoom-in"
                  onClick={() => setIsModalOpen(true)}
                  aria-hidden="true"
                 >
                   <ZoomIcon />
                 </div>
                <a
                  href={message.imageUrl}
                  download="dental-diagram.png"
                  className="absolute top-2 right-2 bg-gray-900/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Download diagram"
                  title="Download diagram"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DownloadIcon />
                </a>
              </div>
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
             <TransformWrapper>
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%'}}
                  contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                  <img
                    src={message.imageUrl}
                    alt="Generated dental diagram - zoomed"
                    className="max-w-full max-h-full object-contain"
                  />
                </TransformComponent>
            </TransformWrapper>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-0 right-0 m-4 text-white bg-gray-900/70 p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close image view"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;