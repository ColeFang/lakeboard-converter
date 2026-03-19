const HTML_TAG_RE = /<[^>]+>/g;
const ZERO_WIDTH_RE = /[\u200b\ufeff]/g;
const NBSP_RE = /\u00a0/g;

const htmlEntityMap: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function decodeHtmlEntities(input: string): string {
  return input.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => htmlEntityMap[entity] ?? entity);
}

export function stripHtml(input: string): string {
  return input.replace(HTML_TAG_RE, '');
}

export function normalizeInlineText(input: string): string {
  const text = decodeHtmlEntities(stripHtml(input))
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(ZERO_WIDTH_RE, '')
    .replace(NBSP_RE, ' ');

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

export function flattenMultilineText(input: string, separator = ' ⏎ '): string {
  return normalizeInlineText(input).split('\n').join(separator);
}
