import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function EmbedCodeGenerator() {
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const embedCodes = {
    rawHtml: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Search</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .blurred { filter: blur(5px); transition: filter 0.3s ease; }
        #chat-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        }
        #chat-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 600px;
            height: 80%;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        #open-chat-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        #open-chat-btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <button id="open-chat-btn">Open Chat Search</button>
    <div id="chat-overlay">
        <div id="chat-container">
            <iframe src="${window.location.origin}"></iframe>
        </div>
    </div>
    <script>
        const openChatBtn = document.getElementById('open-chat-btn');
        const chatOverlay = document.getElementById('chat-overlay');
        const body = document.body;
        openChatBtn.addEventListener('click', () => {
            chatOverlay.style.display = 'block';
            body.classList.add('blurred');
        });
        chatOverlay.addEventListener('click', (event) => {
            if (event.target === chatOverlay) {
                chatOverlay.style.display = 'none';
                body.classList.remove('blurred');
            }
        });
    </script>
</body>
</html>`,
    
    html: `<!-- Add this where you want the search bar to appear -->
<div id="ai-search"></div>

<script>
  (function() {
    if (document.getElementById('ai-search-script')) return;
    var script = document.createElement('script');
    script.id = 'ai-search-script';
    script.src = '${window.location.origin}/embed.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  })();
</script>`,
    
    wordpress: `<?php
/**
 * Add this to your theme's functions.php
 */
function add_ai_search() {
    if (!wp_script_is('ai-search', 'enqueued')) {
        wp_enqueue_script(
            'ai-search', 
            '${window.location.origin}/embed.js',
            array(),
            '1.0',
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'ai_search');

/**
 * Add this shortcode to your template or content:
 * [ai_search]
 */
function ai_search_shortcode() {
    return '<div id="ai-search"></div>';
}
add_shortcode('ai_search', 'ai_search_shortcode');`,
    
    react: `import { useEffect, useRef } from 'react';

export default function AISearch() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const script = document.createElement('script');
    script.id = 'ai-search-script';
    script.src = '${window.location.origin}/embed.js';
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      console.error('Failed to load AI Search widget');
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('ai-search-script');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return <div id="ai-search" />;
}`
  };

  const copyCode = async (type: string) => {
    await navigator.clipboard.writeText(embedCodes[type as keyof typeof embedCodes]);
    setCopied({ [type]: true });
    setTimeout(() => setCopied({ [type]: false }), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Embed Codes</h2>
      
      <div className="space-y-6">
        {Object.entries(embedCodes).map(([type, code]) => (
          <div key={type} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 capitalize">
                {type === 'rawHtml' ? 'Raw HTML (Full Page)' : type}
              </h3>
              <button
                onClick={() => copyCode(type)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {copied[type] ? (
                  <><Check className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Code</>
                )}
              </button>
            </div>
            
            <div className="relative rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={type === 'wordpress' ? 'php' : 'html'}
                style={vs2015}
                customStyle={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  margin: 0
                }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}