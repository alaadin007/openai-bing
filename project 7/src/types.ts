export interface WebsitePage {
  url: string;
  title: string;
  content: string;
  lastCrawled: string;
  fullContent?: PageContent;
}

export interface PageContent {
  title: string;
  metaTags: MetaTag[];
  content: string;
  images: ImageData[];
  sections: PageSection[];
  seo: SEOData;
}

export interface MetaTag {
  name: string;
  content: string;
}

export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export interface PageSection {
  type: 'heading' | 'paragraph' | 'list' | 'image';
  content: string;
  level?: number; // For headings (h1, h2, etc.)
  items?: string[]; // For lists
  className?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
}

export interface WebsiteData {
  domain: string;
  pages: WebsitePage[];
  lastUpdated: string;
  pageCount: number;
}

export interface WebsiteState {
  data: WebsiteData | null;
  isLoading: boolean;
  error: string | null;
}