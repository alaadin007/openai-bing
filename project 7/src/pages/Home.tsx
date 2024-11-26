import React, { useState } from 'react';
import SearchModal from '../components/SearchModal';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <SearchBar onSearch={handleSearch} isLoading={false} />
      </div>

      <SearchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialQuery={searchQuery}
      />
    </div>
  );
}