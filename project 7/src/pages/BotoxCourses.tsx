import React, { useState } from 'react';
import { Brain } from 'lucide-react';

// Sample responses for the prototype
const SAMPLE_RESPONSES: Record<string, string> = {
  default: "I can help you learn more about our Botox courses and training programs. What would you like to know?",
  courses: "We offer several specialized Botox training courses:\n\n• Foundation Botox Course (£1,450)\n• Advanced Botox Mastery (£2,950)\n• Masseter Botox Specialist (£995)\n\nEach course includes hands-on training and certification.",
  social: "Looking to advance your career in medical aesthetics? At the Harley Street Institute, we offer comprehensive courses to help you master the art of aesthetics. From foundation Botox and dermal filler courses for beginners to advanced courses in facial aesthetics, we have the training you need.\n\nVisit [Harley Street Institute](https://www.harleystreetinstitute.com) to learn more.",
  requirements: "Our courses are designed for medical professionals including doctors, dentists, nurses, and pharmacists. You'll need:\n\n• Valid medical license\n• Professional indemnity insurance\n• Basic life support certification",
  schedule: "Courses are available throughout the year with flexible scheduling options. Training includes:\n\n• Online theory modules\n• In-person practical sessions\n• Small group hands-on training",
};

export default function BotoxCourses() {
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'bot';
    content: string;
    timestamp: string;
  }>>([{
    type: 'bot',
    content: SAMPLE_RESPONSES.default,
    timestamp: new Date().toISOString()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const simulateResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    let response = SAMPLE_RESPONSES.default;

    if (lowerQuery.includes('course') || lowerQuery.includes('training') || lowerQuery.includes('price')) {
      response = SAMPLE_RESPONSES.courses;
    } else if (lowerQuery.includes('social') || lowerQuery.includes('post')) {
      response = SAMPLE_RESPONSES.social;
    } else if (lowerQuery.includes('require') || lowerQuery.includes('need') || lowerQuery.includes('qualification')) {
      response = SAMPLE_RESPONSES.requirements;
    } else if (lowerQuery.includes('schedule') || lowerQuery.includes('time') || lowerQuery.includes('when')) {
      response = SAMPLE_RESPONSES.schedule;
    }

    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: simulateResponse(input),
        timestamp: new Date().toISOString()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Chat with Our Botox Course Advisor
              </h1>
              <p className="text-blue-100">
                Ask questions about our courses, requirements, or career opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our Botox courses..."
                className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isTyping ? 'Typing...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}