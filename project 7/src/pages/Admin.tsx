import React from 'react';
import WebsiteCrawler from '../components/WebsiteCrawler';
import WebsiteDataDisplay from '../components/WebsiteDataDisplay';
import EmbedCodeGenerator from '../components/EmbedCodeGenerator';
import KnowledgeInput from '../components/KnowledgeInput';
import SystemPromptEditor from '../components/SystemPromptEditor';
import ManagementSection from '../components/ManagementSection';
import NextJsConverter from '../components/NextJsConverter';
import type { WebsiteData } from '../types';

export default function Admin() {
  const [websiteData, setWebsiteData] = React.useState<WebsiteData | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">User Dashboard</h1>
          
          <ManagementSection />
          <SystemPromptEditor />
          <WebsiteCrawler onWebsiteDataUpdate={setWebsiteData} />
          {websiteData && <WebsiteDataDisplay data={websiteData} />}
          <NextJsConverter />
          <KnowledgeInput />
          <EmbedCodeGenerator />
        </div>
      </div>
    </div>
  );
}