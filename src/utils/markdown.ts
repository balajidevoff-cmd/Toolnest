/**
 * Safe client-side Markdown parser.
 * Converts standard Markdown into sanitized HTML without executing scripts or unsafe elements.
 */
export function renderSafeMarkdown(markdown: string): string {
  // First escape any raw HTML tags to prevent XSS
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = escaped.split('\n');
  const htmlLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        htmlLines.push('</code></pre>');
        inCodeBlock = false;
      } else {
        codeBlockLang = line.slice(3).trim();
        htmlLines.push(`<pre class="p-3 my-2 rounded-xl bg-black/10 dark:bg-black/50 font-mono text-xs overflow-x-auto"><code>`);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      htmlLines.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      htmlLines.push(`<h3 class="text-base font-bold my-2 text-light-text dark:text-dark-text">${parseInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      htmlLines.push(`<h2 class="text-lg font-bold my-2 text-light-text dark:text-dark-text">${parseInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      htmlLines.push(`<h1 class="text-xl font-black my-3 text-light-text dark:text-dark-text">${parseInline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      htmlLines.push(`<blockquote class="border-l-4 border-brand-purple pl-3 my-2 italic text-light-muted dark:text-dark-muted">${parseInline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Bullet lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      htmlLines.push(`<li class="ml-4 list-disc text-xs my-0.5">${parseInline(line.slice(2))}</li>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      htmlLines.push('<hr class="my-3 border-light-border dark:border-dark-border" />');
      continue;
    }

    // Paragraph
    if (line.trim().length > 0) {
      htmlLines.push(`<p class="my-1.5 text-xs leading-relaxed text-light-text dark:text-dark-text">${parseInline(line)}</p>`);
    } else {
      htmlLines.push('<div class="h-1"></div>');
    }
  }

  if (inCodeBlock) {
    htmlLines.push('</code></pre>');
  }

  return htmlLines.join('\n');
}

function parseInline(text: string): string {
  return text
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px] text-brand-purple">$1</code>')
    // Links: [text](url) - ensure url starts with http/https to prevent javascript: pseudo protocols
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-purple hover:underline">$1</a>');
}
