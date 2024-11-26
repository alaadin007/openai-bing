import React, { useState } from 'react';
import { Code, Wand2, Copy, Check } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function NextJsConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const convertToNextJs = () => {
    let converted = input;

    // Remove WordPress-specific PHP tags and functions
    converted = converted.replace(/<?php[\s\S]*?\?>/g, '');
    converted = converted.replace(/get_header\(\);|get_footer\(\);/g, '');
    converted = converted.replace(/get_template_part\([^)]+\);/g, '');
    
    // Convert WordPress functions to Next.js
    converted = converted.replace(/get_the_title\(\)/g, 'title');
    converted = converted.replace(/the_content\(\)/g, 'content');
    converted = converted.replace(/get_permalink\(\)/g, 'href');
    
    // Convert WordPress classes to Tailwind
    converted = converted.replace(/class="/g, 'className="');
    
    // Convert WordPress image handling
    converted = converted.replace(/<img([^>]+)>/g, (match, attrs) => {
      const src = attrs.match(/src="([^"]+)"/) ? attrs.match(/src="([^"]+)"/)[1] : '';
      const alt = attrs.match(/alt="([^"]+)"/) ? attrs.match(/alt="([^"]+)"/)[1] : '';
      return `<Image\n  src="${src}"\n  alt="${alt}"\n  width={800}\n  height={600}\n  className="w-full h-auto"\n/>`;
    });

    // Add Next.js imports and structure
    const imports = `import { NextPage } from 'next';\nimport Image from 'next/image';\nimport Link from 'next/link';\n\n`;
    
    const pageStructure = `
const Page: NextPage = () => {
  return (
    <main className="min-h-screen bg-white">
      ${converted}
    </main>
  );
};

export default Page;
`;

    setOutput(imports + pageStructure);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Code className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">WordPress to Next.js Converter</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste WordPress Code
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 text-sm font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Paste your WordPress code here..."
          />
        </div>

        <button
          onClick={convertToNextJs}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Wand2 className="w-4 h-4" /> Convert to Next.js
        </button>

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Converted Next.js Code</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {copied ? (
                  <><Check className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Code</>
                )}
              </button>
            </div>
            
            <div className="relative">
              <SyntaxHighlighter
                language="typescript"
                style={vs2015}
                customStyle={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  margin: 0
                }}
              >
                {output}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}