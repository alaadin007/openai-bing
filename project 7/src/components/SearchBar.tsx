import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <div className="relative">
        {/* Glamorous background effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-800 to-navy-900 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your Harley Street Institute mentor..."
            className="w-full px-6 py-4 pl-14 pr-20 text-gray-900 bg-white/90 backdrop-blur-sm border-2 border-blue-800/20 rounded-xl focus:border-blue-700 focus:ring-4 focus:ring-blue-700/20 transition-all duration-300 ease-in-out shadow-lg shadow-blue-900/10 placeholder:text-gray-500"
            disabled={isLoading}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-800 w-5 h-5 opacity-70" />
          
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg hover:from-blue-800 hover:to-blue-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="font-medium">Ask</span>
            )}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10 -inset-1 rounded-xl bg-gradient-to-r from-blue-600/20 via-blue-800/20 to-navy-900/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
        <div className="absolute -z-10 -inset-2 rounded-xl bg-gradient-to-r from-blue-600/10 via-blue-800/10 to-navy-900/10 blur-2xl opacity-0 group-hover:opacity-100 transition duration-700 delay-100" />
      </div>
    </form>
  );
}