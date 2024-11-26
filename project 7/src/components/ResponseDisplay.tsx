import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';

interface ResponseDisplayProps {
  response: string | null;
  error: string | null;
  isLoading: boolean;
}

function formatResponse(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">$1</a>');
}

function formatContent(text: string): string {
  const lines = text.split('\n');
  let inTable = false;
  let tableContent = '';
  
  return lines.map(line => {
    if (line.includes('|')) {
      if (!inTable) {
        inTable = true;
        tableContent = '<table class="min-w-full divide-y divide-gray-200 my-2"><tbody>';
      }
      const cells = line.split('|').filter(Boolean);
      tableContent += `<tr class="border-b border-gray-200">${
        cells.map((cell, i) => `<td class="py-1 px-4 ${i === 0 ? 'font-bold' : ''}">${cell.trim()}</td>`).join('')
      }</tr>`;
      return '';
    } else if (inTable) {
      inTable = false;
      return tableContent + '</tbody></table>';
    }

    if (line.startsWith('# ')) {
      return `<h2 class="text-2xl font-bold text-gray-900 mb-2 mt-4">${line.slice(2)}</h2>`;
    }
    if (line.startsWith('## ')) {
      return `<h3 class="text-xl font-bold text-gray-800 mb-2 mt-3">${line.slice(3)}</h3>`;
    }

    if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
      const content = line.trim().slice(2);
      return `<div class="flex items-start space-x-2 mb-1">
        <span class="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
        <span>${content}</span>
      </div>`;
    }

    if (line.trim().match(/^\d+\./)) {
      const [number, ...content] = line.split('.');
      return `<div class="flex items-start space-x-2 mb-1">
        <span class="font-bold text-blue-600 min-w-[1.5rem]">${number}.</span>
        <span>${content.join('.').trim()}</span>
      </div>`;
    }

    if (line.includes(':')) {
      const [title, ...content] = line.split(':');
      if (content.length > 0) {
        return `<p class="mb-2"><strong>${title}:</strong>${content.join(':')}</p>`;
      }
    }

    return line.trim() ? `<p class="mb-2">${line}</p>` : '';
  }).join('\n');
}

function TypewriterText({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
    setDisplayedContent('');
    setIsComplete(false);

    let currentIndex = 0;
    let lastTime = Date.now();
    
    const typeNextCharacter = () => {
      if (currentIndex >= contentRef.current.length) {
        setIsComplete(true);
        return;
      }

      const now = Date.now();
      const timeSinceLastChar = now - lastTime;
      
      // Faster typing speed with shorter pauses
      let delay = 10; // Base typing speed (reduced from 20)
      const currentChar = contentRef.current[currentIndex];
      
      if ('.!?'.includes(currentChar)) {
        delay = 150; // Shorter pause after sentences (reduced from 300)
      } else if (',;:'.includes(currentChar)) {
        delay = 75; // Shorter pause after clauses (reduced from 150)
      } else if (currentChar === '\n') {
        delay = 50; // Shorter pause at line breaks (reduced from 100)
      }

      if (timeSinceLastChar >= delay) {
        setDisplayedContent(prev => prev + currentChar);
        currentIndex++;
        lastTime = now;
      }

      requestAnimationFrame(typeNextCharacter);
    };

    const animationFrame = requestAnimationFrame(typeNextCharacter);
    return () => cancelAnimationFrame(animationFrame);
  }, [content]);

  return (
    <div 
      className={`prose prose-sm max-w-none transition-opacity duration-200 leading-snug ${
        isComplete ? 'opacity-100' : 'opacity-90'
      }`}
      dangerouslySetInnerHTML={{ 
        __html: formatContent(formatResponse(displayedContent)) 
      }}
    />
  );
}

export default function ResponseDisplay({ response, error, isLoading }: ResponseDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="relative">
          <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-[bounce_1s_infinite]" />
          <p className="text-lg font-medium text-gray-700">Thinking</p>
        </div>
      </div>
    );
  }

  if (!response && !error) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error ? (
        <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="p-6 rounded-xl border-2 border-gray-200 bg-white shadow-lg">
          <TypewriterText content={response} />
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">
                Harley Street Institute Mentor
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}