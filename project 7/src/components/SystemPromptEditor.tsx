import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { websiteStorage } from '../services/storage';

export default function SystemPromptEditor() {
  const [prompt, setPrompt] = useState(`You are a knowledgeable representative of the Harley Street Institute, speaking with expertise about our courses, treatments, and services. Your responses should:

1. Draw primarily from our website's knowledge base
2. Maintain a professional yet approachable tone
3. Demonstrate deep understanding of aesthetic medicine
4. Reference specific courses and services when relevant
5. Provide accurate, up-to-date information
6. Avoid medical advice but explain procedures generally

When discussing treatments or courses:
- Focus on educational aspects and professional development
- Highlight our institute's expertise and facilities
- Encourage inquiries through official channels
- Maintain compliance with medical advertising guidelines`);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadPrompt();
  }, []);

  const loadPrompt = async () => {
    try {
      const savedPrompt = await websiteStorage.getSystemPrompt();
      if (savedPrompt) {
        setPrompt(savedPrompt);
      }
    } catch (err) {
      console.error('Failed to load system prompt:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await websiteStorage.saveSystemPrompt(prompt);
      setSaveMessage({ type: 'success', text: 'System prompt updated successfully!' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save system prompt' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">System Prompt</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Prompt</>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Customize how the AI assistant represents your organization and responds to queries.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 text-sm font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter system prompt..."
        />

        {saveMessage && (
          <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {saveMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}