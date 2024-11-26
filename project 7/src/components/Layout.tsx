import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Brain, Settings, BookOpen } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Knowledge Search</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Powered by Bing Search and OpenAI
            </p>
            <div className="flex items-center gap-4">
              <Link 
                to="/rules" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Rules
              </Link>
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}