import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ResponseDisplay from './ResponseDisplay';
import { searchWithOpenAI } from '../services/openai';

export default function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{
    question: string;
    response: string;
    timestamp: string;
  }>>([]);

  const openChat = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeChat = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchWithOpenAI(query);
      setConversation(prev => [...prev, {
        question: query,
        response: result,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setError('Unable to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 z-50"
      >
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Chat with AI Assistant
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeChat}
          />
          
          <div 
            className="relative w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeChat}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              ×
            </button>
            
            <div className="h-full flex flex-col p-6">
              <div className="flex-1 overflow-y-auto mb-6 space-y-6">
                {conversation.map((item, index) => (
                  <div key={index} className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Question:</p>
                      <p className="text-gray-900">{item.question}</p>
                    </div>
                    <ResponseDisplay 
                      response={item.response}
                      error={null}
                      isLoading={false}
                    />
                  </div>
                ))}
                
                {isLoading && (
                  <ResponseDisplay 
                    response={null}
                    error={error}
                    isLoading={true}
                  />
                )}
              </div>
              
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}