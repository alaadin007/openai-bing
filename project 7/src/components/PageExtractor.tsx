import React, { useState } from 'react';
import { Eye, Code, Database, Loader2 } from 'lucide-react';
import { extractPageContent } from '../services/pageExtractor';
import type { PageContent } from '../types';
import { convertToNextJs } from '../services/nextjsConverter';

interface PageExtractorProps {
  url: string;
  title: string;
}

export default function PageExtractor({ url, title }: PageExtractorProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'meta'>('preview');
  const [showModal, setShowModal] = useState(false);

  const handleExtract = async () => {
    try {
      setIsExtracting(true);
      setError(null);
      const content = await extractPageContent(url);
      
      if (!content) {
        throw new Error('No content could be extracted');
      }
      
      setPageContent(content);
      setShowModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract page content';
      setError(errorMessage);
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadContent = () => {
    if (!pageContent) return;

    const content = {
      raw: JSON.stringify(pageContent, null, 2),
      nextjs: convertToNextJs(pageContent)
    };

    const blob = new Blob([content.nextjs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.tsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <button
        onClick={handleExtract}
        disabled={isExtracting}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExtracting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
        ) : (
          <><Eye className="w-4 h-4" /> Extract Content</>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {showModal && pageContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === 'preview' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Eye className="w-4 h-4" /> Content Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === 'raw'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Code className="w-4 h-4" /> Raw HTML
                  </button>
                  <button
                    onClick={() => setActiveTab('meta')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === 'meta'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Database className="w-4 h-4" /> Metadata
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                  {activeTab === 'preview' && (
                    <div className="prose prose-blue max-w-none">
                      <h1>{pageContent.title}</h1>
                      {pageContent.sections.map((section, index) => {
                        switch (section.type) {
                          case 'heading':
                            const HeadingTag = `h${section.level}` as keyof JSX.IntrinsicElements;
                            return <HeadingTag key={index}>{section.content}</HeadingTag>;
                          case 'paragraph':
                            return <p key={index}>{section.content}</p>;
                          case 'list':
                            return (
                              <ul key={index}>
                                {section.items?.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  )}

                  {activeTab === 'raw' && (
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {pageContent.content}
                    </pre>
                  )}

                  {activeTab === 'meta' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">SEO Data</h4>
                        <dl className="grid grid-cols-2 gap-2">
                          <dt className="text-sm text-gray-600">Title</dt>
                          <dd className="text-sm">{pageContent.seo.title}</dd>
                          <dt className="text-sm text-gray-600">Description</dt>
                          <dd className="text-sm">{pageContent.seo.description}</dd>
                          <dt className="text-sm text-gray-600">Keywords</dt>
                          <dd className="text-sm">{pageContent.seo.keywords.join(', ')}</dd>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Meta Tags</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="text-left text-sm font-medium text-gray-600 py-2">Name</th>
                              <th className="text-left text-sm font-medium text-gray-600 py-2">Content</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {pageContent.metaTags.map((tag, index) => (
                              <tr key={index}>
                                <td className="py-2 text-sm">{tag.name}</td>
                                <td className="py-2 text-sm">{tag.content}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Images</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="text-left text-sm font-medium text-gray-600 py-2">Source</th>
                              <th className="text-left text-sm font-medium text-gray-600 py-2">Alt Text</th>
                              <th className="text-left text-sm font-medium text-gray-600 py-2">Dimensions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {pageContent.images.map((image, index) => (
                              <tr key={index}>
                                <td className="py-2 text-sm">{image.src}</td>
                                <td className="py-2 text-sm">{image.alt}</td>
                                <td className="py-2 text-sm">
                                  {image.width && image.height 
                                    ? `${image.width}×${image.height}`
                                    : 'Not specified'
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={downloadContent}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Code className="w-4 h-4" /> Download Next.js Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}