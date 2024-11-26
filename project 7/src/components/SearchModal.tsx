import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ResponseDisplay from './ResponseDisplay';
import SearchBar from './SearchBar';
import { searchWithOpenAI } from '../services/openai';

interface QAPair {
  question: string;
  response: string;
  timestamp: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
}

export default function SearchModal({ isOpen, onClose, initialQuery }: SearchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<QAPair[]>([]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && initialQuery && conversation.length === 0) {
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {isLoading ? 'Getting your answer...' : 'Conversation'}
            </h2>
            
            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
              {conversation.map((qa, index) => (
                <div key={index} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Question:</p>
                    <p className="text-gray-900">{qa.question}</p>
                  </div>
                  <ResponseDisplay 
                    response={qa.response} 
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
            
            <div className="mt-8 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}