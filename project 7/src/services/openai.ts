import OpenAI from 'openai';
import { websiteStorage } from './storage';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Map of course names to their URLs
const courseLinks: Record<string, string> = {
  'Masseter Botox Course': '/masseter-botox',
  'Foundation Course': '/foundation',
  'Advanced Botox Training': '/adv-botox',
  'Dermal Fillers Course': '/fillers',
  'Facial Aesthetic Certificate': '/face-cert',
  'Advanced Aesthetics': '/advanced',
  'Masterclass': '/master',
  'Lip Fillers Course': '/lip-fillers',
  'PDO Threads Training': '/pdo-threads'
};

function formatLinks(text: string): string {
  let formattedText = text;
  
  // Replace course mentions with links (only first occurrence)
  Object.entries(courseLinks).forEach(([courseName, path]) => {
    const shortUrl = `https://www.harleystreetinstitute.com${path}`;
    
    // Replace only the first occurrence of the course name
    const courseRegex = new RegExp(`\\b${courseName}\\b(?![\\]\\)])`, '');
    if (courseRegex.test(formattedText)) {
      formattedText = formattedText.replace(courseRegex, `[${courseName}](${shortUrl})`);
    }
  });

  // Move all links to a new paragraph at the end
  const links: string[] = [];
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    links.push(`[${text}](${url})`);
    return text;
  });

  // Add links section if there are any links
  if (links.length > 0) {
    formattedText += '\n\nLearn more:\n' + links.join('\n');
  }

  // Clean up formatting
  return formattedText
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\n\n+/g, '\n\n') // Fix spacing
    .trim();
}

export async function searchWithOpenAI(query: string): Promise<string> {
  try {
    const [websites, customKnowledge, systemPrompt, rules] = await Promise.all([
      websiteStorage.getAllWebsites(),
      websiteStorage.getCustomKnowledge(),
      websiteStorage.getSystemPrompt(),
      websiteStorage.getRules()
    ]);

    // Combine website knowledge
    const websiteKnowledge = websites
      .map(site => site.pages
        .map(page => `${page.title}\n${page.content}`)
        .join('\n\n'))
      .join('\n\n');

    // Combine custom knowledge
    const customKnowledgeText = customKnowledge
      .map(entry => `${entry.title}\n${entry.content}`)
      .join('\n\n');

    // Construct the full prompt
    const fullPrompt = `${systemPrompt || ''}

RULES:
${rules || ''}

WEBSITE KNOWLEDGE:
${websiteKnowledge}

CUSTOM KNOWLEDGE:
${customKnowledgeText}

USER QUERY:
${query}

Please provide a natural, conversational response that:
1. Provides valuable information first before mentioning courses
2. Uses clear, concise language without bold text or emphasis
3. Mentions course names only when relevant
4. Maintains a professional yet approachable tone
5. Includes relevant course links only once
6. Uses proper spacing and paragraph breaks
7. Avoids mentioning competitors
8. Keeps paragraphs short and focused
9. Places all links in a separate section at the end`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        { 
          role: 'system', 
          content: 'You are a knowledgeable representative of the Harley Street Institute. Provide clear, natural responses without unnecessary formatting or emphasis.' 
        },
        { 
          role: 'user', 
          content: fullPrompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    let response = completion.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at this moment. Please contact the Harley Street Institute directly for assistance.';

    // Format links and clean up the response
    response = formatLinks(response);

    return response;
  } catch (error) {
    console.error('Search Error:', error);
    throw new Error('Failed to get response');
  }
}