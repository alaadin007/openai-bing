import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';
import type { PageContent } from '../types';

// Use a more reliable CORS proxy
const CORS_PROXY = 'https://corsproxy.io/?';

export async function extractPageContent(url: string): Promise<PageContent> {
  try {
    // Use CORS proxy with timeout and retry logic
    const response = await fetchWithRetry(`${CORS_PROXY}${encodeURIComponent(url)}`);
    const html = await response.text();
    
    if (!html) {
      throw new Error('No HTML content received');
    }

    // Parse HTML with error handling
    const $ = cheerio.load(html, { 
      decodeEntities: true,
      xmlMode: false
    });

    // Clean the HTML first
    $('script, style, noscript, iframe, link[rel="stylesheet"]').remove();

    // Extract content with error boundaries
    const [metaTags, images, sections, seo] = await Promise.all([
      extractMetaTags($),
      extractImages($, url),
      extractSections($),
      extractSEO($)
    ]);

    // Convert HTML to clean text with better options
    const content = convert($.html(), {
      wordwrap: 130,
      preserveNewlines: true,
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'h1', format: 'heading' },
        { selector: 'h2', format: 'heading' },
        { selector: 'h3', format: 'heading' },
        { selector: 'h4', format: 'heading' },
        { selector: 'h5', format: 'heading' },
        { selector: 'h6', format: 'heading' }
      ]
    });

    const result: PageContent = {
      title: $('title').text() || url,
      metaTags,
      content,
      images,
      sections,
      seo
    };

    // Validate the result
    if (!result.content && !result.sections.length) {
      throw new Error('No content could be extracted from the page');
    }

    return result;
  } catch (error) {
    console.error('Failed to extract page content:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract page content');
  }
}

// Helper function to fetch with retry logic
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      if (i === retries - 1) {
        throw new Error(`Failed to fetch after ${retries} retries: ${lastError.message}`);
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, i) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

// Rest of the code remains the same...