import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { crawlWebsite } from '../services/bing';
import { websiteStorage } from '../services/storage';
import PageExtractor from './PageExtractor';
import type { WebsiteData } from '../types';

interface WebsiteCrawlerProps {
  onWebsiteDataUpdate: (data: WebsiteData) => void;
}

interface SiteInput {
  id: string;
  url: string;
}

export default function WebsiteCrawler({ onWebsiteDataUpdate }: WebsiteCrawlerProps) {
  const [siteInputs, setSiteInputs] = useState<SiteInput[]>([
    { id: '1', url: '' },
    { id: '2', url: '' }
  ]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [expandedSites, setExpandedSites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      const sites = await websiteStorage.getAllWebsites();
      setWebsites(sites);
    } catch (err) {
      console.error('Failed to load websites:', err);
    }
  };

  const handleCrawl = async (siteInput: SiteInput) => {
    if (!siteInput.url) return;

    try {
      setIsLoading(prev => ({ ...prev, [siteInput.id]: true }));
      setError(prev => ({ ...prev, [siteInput.id]: null }));
      
      const urlObj = new URL(siteInput.url);
      
      const websiteData = await crawlWebsite(siteInput.url);
      await websiteStorage.saveWebsite(websiteData);
      onWebsiteDataUpdate(websiteData);
      
      setSiteInputs(prev => 
        prev.map(input => 
          input.id === siteInput.id ? { ...input, url: '' } : input
        )
      );
      
      await loadWebsites();
    } catch (err) {
      setError(prev => ({
        ...prev,
        [siteInput.id]: err instanceof Error ? err.message : 'Failed to crawl website'
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [siteInput.id]: false }));
    }
  };

  const handleDelete = async (domain: string) => {
    try {
      await websiteStorage.deleteWebsite(domain);
      await loadWebsites();
    } catch (err) {
      console.error('Failed to delete website:', err);
    }
  };

  const toggleSite = (domain: string) => {
    setExpandedSites(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Website Knowledge Base</h2>
      
      <div className="space-y-6">
        {siteInputs.map((siteInput, index) => (
          <div key={siteInput.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium text-gray-900">
                Site {index + 1}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor={`website-url-${siteInput.id}`} 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Website URL
                </label>
                <div className="relative">
                  <input
                    id={`website-url-${siteInput.id}`}
                    type="url"
                    value={siteInput.url}
                    onChange={(e) => {
                      setSiteInputs(prev =>
                        prev.map(input =>
                          input.id === siteInput.id
                            ? { ...input, url: e.target.value }
                            : input
                        )
                      );
                    }}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading[siteInput.id]}
                  />
                </div>
              </div>
              
              {error[siteInput.id] && (
                <div className="text-sm text-red-600">
                  {error[siteInput.id]}
                </div>
              )}

              <button
                onClick={() => handleCrawl(siteInput)}
                disabled={isLoading[siteInput.id] || !siteInput.url}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading[siteInput.id] ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Crawling Website...</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Crawl Website</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {websites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Crawled Websites</h3>
          <div className="space-y-3">
            {websites.map((site) => (
              <div key={site.domain} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <button
                    onClick={() => toggleSite(site.domain)}
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{site.domain}</h4>
                      <p className="text-sm text-gray-500">
                        {site.pageCount} pages • Last updated: {new Date(site.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    {expandedSites[site.domain] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(site.domain)}
                    className="ml-4 p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {expandedSites[site.domain] && (
                  <div className="border-t border-gray-200">
                    <div className="max-h-96 overflow-y-auto">
                      <div className="divide-y divide-gray-200">
                        {site.pages.map((page, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50">
                            <h5 className="font-medium text-gray-900 mb-1">{page.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{page.content}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Last crawled: {new Date(page.lastCrawled).toLocaleString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  Visit <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            
                            <PageExtractor url={page.url} title={page.title} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}