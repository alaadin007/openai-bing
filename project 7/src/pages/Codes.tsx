import React from 'react';
import EmbedCodeGenerator from '../components/EmbedCodeGenerator';

export default function Codes() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Integration Codes</h1>
        <EmbedCodeGenerator />
      </div>
    </div>
  );
}