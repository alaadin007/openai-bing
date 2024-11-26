import React, { useState, useEffect } from 'react';
import { Clock, Globe, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { WebsiteData } from '../types';

interface WebsiteDataDisplayProps {
  data: WebsiteData;
}

export default function WebsiteDataDisplay({ data }: WebsiteDataDisplayProps) {
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // Initialize expanded state when data changes
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    data.pages.forEach(page => {
      initialState[page.url] = false;
    });
    setExpandedPages(initialState);
    setIsAllExpanded(false);
  }, [data]);

  const togglePage = (url: string) => {
    setExpandedPages(prev => {
      const newState = { ...prev, [url]: !prev[url] };
      setIsAllExpanded(Object.values(newState).every(v => v));
      return newState;
    });
  };

  const toggleAll = () => {
    const newExpandedState = !isAllExpanded;
    const newState: Record<string, boolean> = {};
    data.pages.forEach(page => {
      newState[page.url] = newExpandedState;
    });
    setExpandedPages(newState);
    setIsAllExpanded(newExpandedState);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Website Data</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Globe className="w-4 h-4" />
            Domain
          </div>
          <div className="text-lg font-medium">{data.domain}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            Pages Indexed
          </div>
          <div className="text-lg font-medium">{data.pageCount}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Indexed Pages</h4>
          <button
            onClick={toggleAll}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isAllExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        
        <div className="max-h-[32rem] overflow-y-auto space-y-3 pr-2">
          {data.pages.map((page, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => togglePage(page.url)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h5 className="font-medium text-gray-900 truncate">{page.title}</h5>
                  <p className="text-sm text-gray-600 truncate">{page.url}</p>
                </div>
                {expandedPages[page.url] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedPages[page.url] && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Content Preview</h6>
                      <p className="text-sm text-gray-600">{page.content}</p>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Last Crawled</h6>
                      <p className="text-sm text-gray-600">
                        {new Date(page.lastCrawled).toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Visit Page <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}