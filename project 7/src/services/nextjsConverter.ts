import { PageContent } from '../types';

export function convertToNextJs(pageContent: PageContent): string {
  // Generate imports
  const imports = `import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { Container } from '@/components/Container';

`;

  // Generate meta tags
  const metaTags = pageContent.metaTags
    .map(meta => `        <meta name="${meta.name}" content="${meta.content}" />`)
    .join('\n');

  // Convert WordPress specific elements
  const convertWordPressClasses = (className: string = '') => {
    return className
      .replace('wp-block-', '')
      .replace('aligncenter', 'mx-auto')
      .replace('alignleft', 'float-left mr-4')
      .replace('alignright', 'float-right ml-4');
  };

  // Generate main content sections
  const generateSections = () => {
    return pageContent.sections
      .map(section => {
        const className = convertWordPressClasses(section.className);
        
        switch (section.type) {
          case 'heading':
            return `        <h${section.level}${className ? ` className="${className}"` : ''}>${section.content}</h${section.level}>`;
          case 'paragraph':
            return `        <p${className ? ` className="${className}"` : ''}>${section.content}</p>`;
          case 'list':
            const items = section.items?.map(item => `          <li>${item}</li>`).join('\n') || '';
            return `        <ul${className ? ` className="${className}"` : ''}>\n${items}\n        </ul>`;
          default:
            return '';
        }
      })
      .join('\n\n');
  };

  // Generate image components
  const generateImages = () => {
    return pageContent.images
      .map(img => {
        const className = convertWordPressClasses(img.className);
        return `        <div${className ? ` className="${className}"` : ''}>
          <Image
            src="${img.src}"
            alt="${img.alt}"
            width={${img.width || 800}}
            height={${img.height || 600}}
            className="w-full h-auto"
            priority
          />
        </div>`;
      })
      .join('\n\n');
  };

  // Generate the full page component
  const pageComponent = `const Page: NextPage = () => {
  return (
    <>
      <Head>
        <title>${pageContent.seo.title}</title>
        <meta name="description" content="${pageContent.seo.description}" />
        <meta name="keywords" content="${pageContent.seo.keywords.join(', ')}" />
${metaTags}
        ${pageContent.seo.canonical ? `<link rel="canonical" href="${pageContent.seo.canonical}" />` : ''}
      </Head>

      <Container>
        <main className="py-12">
${generateSections()}

${generateImages()}
        </main>
      </Container>
    </>
  );
};

export default Page;`;

  // Add image download instructions
  const imageInstructions = pageContent.images
    .map(img => `// Download this image: ${img.src}`)
    .join('\n');

  return `${imports}// Image Instructions:
${imageInstructions}

${pageComponent}`;
}