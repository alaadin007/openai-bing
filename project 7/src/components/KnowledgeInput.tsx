import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, Loader2 } from 'lucide-react';
import { websiteStorage } from '../services/storage';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
}

export default function KnowledgeInput() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([
    { id: '1', title: '', content: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const savedEntries = await websiteStorage.getCustomKnowledge();
      if (savedEntries.length > 0) {
        setEntries(savedEntries);
      }
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    }
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { 
      id: String(Date.now()),
      title: '',
      content: ''
    }]);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof KnowledgeEntry, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const validEntries = entries.filter(entry => entry.title && entry.content);
      await websiteStorage.saveCustomKnowledge(validEntries);
      setSaveMessage({ type: 'success', text: 'Knowledge base updated successfully!' });
    } catch (err) {
      console.error('Save error:', err);
      setSaveMessage({ type: 'error', text: 'Failed to save knowledge base' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Custom Knowledge Base</h2>
        <button
          onClick={addEntry}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Entry {index + 1}</h3>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={entry.content}
                  onChange={(e) => updateEntry(entry.id, 'content', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter knowledge content..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Knowledge Base</>
          )}
        </button>
        {saveMessage && (
          <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {saveMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}