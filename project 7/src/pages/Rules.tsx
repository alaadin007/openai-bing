import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Loader2 } from 'lucide-react';
import { websiteStorage } from '../services/storage';

export default function Rules() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rules, setRules] = useState(`# AI Response Guidelines

1. Maintain a conversational, natural tone
2. Avoid repetitive or overly formal sentence structures
3. Focus on providing direct, valuable information
4. Use organization-specific context appropriately

## Response Structure
- Begin with key information, avoiding lengthy preambles
- Use active language and direct statements
- Break content into digestible paragraphs
- Include relevant examples when helpful

## Language Guidelines
- Skip phrases like "In the context of" or "It's important to note"
- Use natural transitions between topics
- Maintain professional yet approachable tone
- Reference specific pages or services when relevant`);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const savedRules = await websiteStorage.getRules();
      if (savedRules) {
        setRules(savedRules);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await websiteStorage.saveRules(rules);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save rules:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Response Guidelines</h1>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Rules</>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Edit Rules
              </button>
            )}
          </div>
        </div>

        <div className="prose prose-blue max-w-none">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {isEditing ? (
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full h-[600px] p-4 font-mono text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter response guidelines..."
              />
            ) : (
              <div className="markdown-preview">
                <div 
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: rules.split('\n').map(line => {
                    if (line.startsWith('# ')) {
                      return `<h2 class="text-xl font-semibold text-gray-900 mb-6">${line.slice(2)}</h2>`;
                    } else if (line.startsWith('## ')) {
                      return `<h3 class="text-lg font-medium text-gray-900 mt-6 mb-4">${line.slice(3)}</h3>`;
                    } else if (line.startsWith('- ')) {
                      return `<li class="ml-4">${line.slice(2)}</li>`;
                    } else if (line.match(/^\d+\./)) {
                      return `<li class="ml-4">${line.replace(/^\d+\.\s*/, '')}</li>`;
                    } else if (line.trim() === '') {
                      return '<br>';
                    }
                    return line;
                  }).join('\n') }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}