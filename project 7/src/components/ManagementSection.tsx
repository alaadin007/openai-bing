import React from 'react';
import { Info, Package } from 'lucide-react';

export default function ManagementSection() {
  const botInfo = {
    version: '1.0',
    name: 'Harley Street Institute Mentor',
    features: [
      'Website Knowledge Integration',
      'Custom Knowledge Base',
      'System Prompt Customization',
      'Response Rules Management',
      'Multi-site Support',
      'Embeddable Widget',
      'Natural Language Processing',
      'Context-Aware Responses'
    ],
    components: [
      'Search Interface',
      'User Dashboard',
      'Knowledge Management',
      'Response Guidelines',
      'Embed Code Generator'
    ],
    technical: {
      frontend: 'React + TypeScript + Tailwind CSS',
      storage: 'IndexedDB',
      apis: ['OpenAI GPT-3.5-16k', 'Bing Web Search'],
      deployment: 'SaaS-ready'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bot Configuration</h2>
          <p className="text-sm text-gray-500">Version {botInfo.version}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Features</h3>
            <ul className="space-y-1">
              {botInfo.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Components</h3>
            <ul className="space-y-1">
              {botInfo.components.map((component, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  {component}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Technical Details</h3>
            <div className="space-y-2">
              {Object.entries(botInfo.technical).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-gray-700 capitalize">{key}: </span>
                  <span className="text-gray-600">
                    {Array.isArray(value) ? value.join(', ') : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-900">SaaS Deployment</h4>
            </div>
            <p className="text-sm text-blue-700">
              This bot is ready for SaaS deployment. Each instance can be customized with:
            </p>
            <ul className="mt-2 space-y-1">
              <li className="text-sm text-blue-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Custom website knowledge base
              </li>
              <li className="text-sm text-blue-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Unique system prompts
              </li>
              <li className="text-sm text-blue-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Tailored response rules
              </li>
              <li className="text-sm text-blue-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Organization-specific branding
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}