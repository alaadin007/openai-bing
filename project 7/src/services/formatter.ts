import { marked } from 'marked';

// Configure marked for custom rendering
marked.use({
  renderer: {
    // Customize heading rendering
    heading(text, level) {
      const size = level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg';
      return `<h${level} class="${size} font-bold text-gray-900 mb-3">${text}</h${level}>`;
    },
    // Customize paragraph rendering
    paragraph(text) {
      return `<p class="text-lg leading-relaxed mb-4">${text}</p>`;
    },
    // Customize list rendering
    list(body, ordered) {
      const type = ordered ? 'ol' : 'ul';
      return `<${type} class="text-lg space-y-2 mb-4 ml-6">${body}</${type}>`;
    },
    // Customize list item rendering
    listitem(text) {
      return `<li class="flex items-start gap-2">
        <span class="mt-2.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
        <span>${text}</span>
      </li>`;
    },
    // Enhanced table rendering
    table(header, body) {
      return `<div class="overflow-x-auto my-6 rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">${header}</thead>
          <tbody class="bg-white divide-y divide-gray-200">${body}</tbody>
        </table>
      </div>`;
    },
    tablerow(content) {
      return `<tr class="hover:bg-gray-50 transition-colors">${content}</tr>`;
    },
    tablecell(content, { header, align }) {
      const tag = header ? 'th' : 'td';
      const alignClass = align 
        ? `text-${align}` 
        : 'text-left';
      const classes = [
        header ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-700',
        'px-6 py-4 text-base whitespace-nowrap',
        alignClass
      ].join(' ');
      return `<${tag} class="${classes}">${content}</${tag}>`;
    },
    // Customize link rendering
    link(href, title, text) {
      // Handle course links specially
      if (href.includes('harleystreetinstitute.com') || href.includes('theharleystreet.com')) {
        return `<a href="${href}" class="text-blue-600 hover:text-blue-700 font-medium">${text}</a>`;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" 
        class="text-blue-600 hover:text-blue-700 underline">${text}</a>`;
    }
  }
});

export function formatResponse(text: string): string {
  // Pre-process the text to ensure proper markdown formatting
  const processedText = text
    // Ensure proper spacing for lists
    .replace(/^[•-]\s*/gm, '* ')
    // Ensure proper spacing for headings
    .replace(/^(#+)(?!\s)/gm, '$1 ')
    // Convert URLs to markdown links if not already formatted
    .replace(
      /(?<![\[\(])(https?:\/\/[^\s\)]+)(?![\]\)])/g,
      '[$1]($1)'
    )
    // Ensure proper table formatting
    .replace(/\|{2,}/g, '|') // Fix multiple pipes
    .replace(/^\s*\||\|\s*$/gm, '') // Remove leading/trailing pipes
    .replace(/\n{2,}/g, '\n\n') // Fix multiple newlines
    .trim();

  // Parse with marked
  return marked(processedText);
}</content>