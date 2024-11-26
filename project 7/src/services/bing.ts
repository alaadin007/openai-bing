import { WebsiteData, PageContent } from '../types';
import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';

const BING_SEARCH_API_ENDPOINT = 'https://api.bing.microsoft.com/v7.0/search';
const MAX_PAGES_PER_SITE = 150;
const RESULTS_PER_REQUEST = 50;

async function fetchPageContent(url: string): Promise<PageContent> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract meta tags
    const metaTags = $('meta').map((_, el) => ({
      name: $(el).attr('name') || $(el).attr('property') || '',
      content: $(el).attr('content') || ''
    })).get().filter(meta => meta.name && meta.content);

    // Extract images
    const images = $('img').map((_, el) => ({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') || '',
      width: $(el).attr('width') ? parseInt($(el).attr('width')!) : undefined,
      height: $(el).attr('height') ? parseInt($(el).attr('height')!) : undefined,
      className: $(el).attr('class')
    })).get();

    // Extract main content sections
    const sections = [];
    $('main, article, .content, #content').first().find('h1, h2, h3, h4, h5, h6, p, ul, ol').each((_, el) => {
      const $el = $(el);
      const tagName = el.tagName.toLowerCase();

      if (tagName.match(/^h[1-6]$/)) {
        sections.push({
          type: 'heading',
          content: $el.text().trim(),
          level: parseInt(tagName[1]),
          className: $el.attr('class')
        });
      } else if (tagName === 'p') {
        sections.push({
          type: 'paragraph',
          content: $el.text().trim(),
          className: $el.attr('class')
        });
      } else if (tagName === 'ul' || tagName === 'ol') {
        sections.push({
          type: 'list',
          content: '',
          items: $el.find('li').map((_, li) => $(li).text().trim()).get(),
          className: $el.attr('class')
        });
      }
    });

    // Extract SEO data
    const seo = {
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [],
      ogImage: $('meta[property="og:image"]').attr('content'),
      canonical: $('link[rel="canonical"]').attr('href')
    };

    // Convert HTML content to clean text
    const cleanContent = convert($.html(), {
      wordwrap: 130,
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { ignoreHref: true } }
      ]
    });

    return {
      title: $('title').text(),
      metaTags,
      content: cleanContent,
      images,
      sections,
      seo
    };
  } catch (error) {
    console.error('Failed to fetch page content:', error);
    throw new Error('Failed to fetch page content');
  }
}

export async function crawlWebsite(url: string): Promise<WebsiteData> {
  try {
    const domain = new URL(url).hostname;
    const allPages: any[] = [];
    let offset = 0;
    let hasMoreResults = true;

    while (hasMoreResults && allPages.length < MAX_PAGES_PER_SITE) {
      const searchQuery = `site:${domain}`;
      const response = await fetch(
        `${BING_SEARCH_API_ENDPOINT}?q=${encodeURIComponent(searchQuery)}&count=${RESULTS_PER_REQUEST}&offset=${offset}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': import.meta.env.VITE_BING_API_KEY,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Website crawl failed: ${response.status}`);
      }

      const data = await response.json();
      const results = data.webPages?.value || [];
      
      if (results.length === 0) {
        hasMoreResults = false;
      } else {
        // Fetch full content for each page
        const pagesWithContent = await Promise.all(
          results.map(async (page: any) => {
            try {
              const fullContent = await fetchPageContent(page.url);
              return {
                url: page.url,
                title: page.name,
                content: page.snippet,
                fullContent,
                lastCrawled: new Date().toISOString()
              };
            } catch (error) {
              console.error(`Failed to fetch content for ${page.url}:`, error);
              return {
                url: page.url,
                title: page.name,
                content: page.snippet,
                lastCrawled: new Date().toISOString()
              };
            }
          })
        );

        allPages.push(...pagesWithContent);
        offset += RESULTS_PER_REQUEST;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const pages = allPages.slice(0, MAX_PAGES_PER_SITE);

    return {
      domain,
      pages,
      lastUpdated: new Date().toISOString(),
      pageCount: pages.length
    };
  } catch (error) {
    console.error('Website Crawl Error:', error);
    throw new Error('Failed to crawl website');
  }
}