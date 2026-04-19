import JSZip from 'jszip';

export interface TopicNode {
  id: string;
  title: string;
  order: number;
  children: TopicNode[];
  notes?: string;
  labels?: string[];
  href?: string;
}

export interface MindMapDocument {
  format: 'lakeboard' | 'xmind';
  root: TopicNode;
  nodeCount: number;
  maxDepth: number;
}

export type MarkdownStyle = 'generic' | 'xmind';

// ─── HTML utilities ───

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
  return input.replace(
    /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g,
    (entity) => htmlEntityMap[entity] ?? entity,
  );
}

function stripHtml(input: string): string {
  return input.replace(HTML_TAG_RE, '');
}

function normalizeInlineText(input: string): string {
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

function flattenMultilineText(input: string, separator = ' ⏎ '): string {
  return normalizeInlineText(input).split('\n').join(separator);
}

// ─── Validation ───

function validateTree(root: TopicNode): { nodeCount: number; maxDepth: number } {
  let nodeCount = 0;
  let maxDepth = 0;

  const visit = (node: TopicNode, depth: number): void => {
    nodeCount += 1;
    maxDepth = Math.max(maxDepth, depth);
    node.children.forEach((child) => visit(child, depth + 1));
  };

  visit(root, 0);
  return { nodeCount, maxDepth };
}

function normalizeTree(root: TopicNode): TopicNode {
  const clone = (node: TopicNode): TopicNode => ({
    ...node,
    title: node.title.trim(),
    children: node.children.map(clone),
  });
  return clone(root);
}

// ─── Lakeboard parser ───

interface RawLakeboardNode {
  id?: string;
  html?: string;
  children?: RawLakeboardNode[];
  type?: string;
}

interface RawLakeboardFile {
  format?: string;
  diagramData?: {
    body?: RawLakeboardNode[];
  };
}

function convertLakeboardNode(node: RawLakeboardNode, order: number): TopicNode {
  return {
    id: node.id ?? `node-${order}`,
    title: normalizeInlineText(node.html ?? '') || '(untitled)',
    order,
    children: (node.children ?? []).map((child, index) =>
      convertLakeboardNode(child, index),
    ),
  };
}

function parseLakeboardContent(content: string): MindMapDocument {
  let data: RawLakeboardFile;
  try {
    data = JSON.parse(content) as RawLakeboardFile;
  } catch {
    throw new Error('无法解析 .lakeboard 文件：JSON 格式错误');
  }

  if (data.format !== 'lakeboard') {
    throw new Error('输入文件不是受支持的 lakeboard JSON 格式');
  }

  const body = data.diagramData?.body;
  if (!Array.isArray(body) || body.length === 0) {
    throw new Error('lakeboard 文件缺少 diagramData.body');
  }

  const rootRaw = body.find((node) => node.type === 'mindmap') ?? body[0];
  if (!rootRaw) {
    throw new Error('未找到可转换的 mindmap 根节点');
  }

  const root = normalizeTree(convertLakeboardNode(rootRaw, 0));
  const { nodeCount, maxDepth } = validateTree(root);

  return { format: 'lakeboard', root, nodeCount, maxDepth };
}

// ─── XMind parser ───

interface XMindTopic {
  id?: string;
  title?: string;
  children?: {
    attached?: XMindTopic[];
  };
  notes?: {
    plain?: { content?: string };
  };
  labels?: string[];
  href?: string;
}

interface XMindSheet {
  id?: string;
  title?: string;
  rootTopic?: XMindTopic;
}

function convertXMindTopic(topic: XMindTopic, order: number): TopicNode {
  const children = topic.children?.attached ?? [];
  return {
    id: topic.id ?? `xmind-node-${order}`,
    title: topic.title ?? '(untitled)',
    order,
    children: children.map((child, index) => convertXMindTopic(child, index)),
    notes: topic.notes?.plain?.content,
    labels: topic.labels,
    href: topic.href,
  };
}

async function parseXmindBuffer(buffer: ArrayBuffer): Promise<MindMapDocument> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new Error(
      '无法解压 .xmind 文件：文件可能已损坏或不是有效的 ZIP 归档',
    );
  }

  const contentFile = zip.file('content.json');
  if (!contentFile) {
    throw new Error(
      '.xmind 文件缺少 content.json，可能是旧版 XMind 8 格式（仅支持 XMind Zen/2020+ 格式）',
    );
  }

  let sheets: XMindSheet[];
  try {
    const contentStr = await contentFile.async('string');
    sheets = JSON.parse(contentStr) as XMindSheet[];
  } catch {
    throw new Error('无法解析 .xmind 文件中的 content.json');
  }

  if (!Array.isArray(sheets) || sheets.length === 0) {
    throw new Error('.xmind 文件中未找到任何画布（sheet）');
  }

  const sheet = sheets[0];
  if (!sheet.rootTopic) {
    throw new Error('.xmind 文件中首个画布缺少 rootTopic');
  }

  const root = normalizeTree(convertXMindTopic(sheet.rootTopic, 0));
  const { nodeCount, maxDepth } = validateTree(root);

  return { format: 'xmind', root, nodeCount, maxDepth };
}

// ─── Markdown renderer ───

function renderGenericNode(
  lines: string[],
  node: TopicNode,
  depth: number,
): void {
  const indent = '  '.repeat(depth);
  if (depth === 0) {
    lines.push(`# ${node.title}`);
  } else {
    const text = node.title.split('\n');
    lines.push(`${indent}- ${text[0]}`);
    for (const line of text.slice(1)) {
      lines.push(`${indent}  ${line}`);
    }
  }

  if (node.notes) {
    const noteIndent = depth === 0 ? '' : `${indent}  `;
    lines.push(
      `${noteIndent}> ${node.notes.split('\n').join(`\n${noteIndent}> `)}`,
    );
  }

  if (node.href) {
    const linkIndent = depth === 0 ? '' : `${indent}  `;
    lines.push(`${linkIndent}[Link](${node.href})`);
  }
}

function walkGeneric(lines: string[], node: TopicNode, depth: number): void {
  renderGenericNode(lines, node, depth);
  node.children.forEach((child) => walkGeneric(lines, child, depth + 1));
}

function walkXmindStyle(
  lines: string[],
  node: TopicNode,
  depth: number,
): void {
  const indent = '    '.repeat(depth);
  lines.push(`${indent}- ${flattenMultilineText(node.title)}`);
  node.children.forEach((child) => walkXmindStyle(lines, child, depth + 1));
}

function renderMarkdown(
  document: MindMapDocument,
  style: MarkdownStyle,
): string {
  const lines: string[] = [];
  if (style === 'xmind') {
    walkXmindStyle(lines, document.root, 0);
  } else {
    walkGeneric(lines, document.root, 0);
  }
  return `${lines.join('\n')}\n`;
}

// ─── Public API ───

export async function convertFile(
  file: File,
  style: MarkdownStyle = 'generic',
): Promise<{ markdown: string; document: MindMapDocument }> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  let document: MindMapDocument;

  if (ext === 'xmind') {
    const buffer = await file.arrayBuffer();
    document = await parseXmindBuffer(buffer);
  } else if (ext === 'lakeboard') {
    const text = await file.text();
    document = parseLakeboardContent(text);
  } else {
    throw new Error(`不支持的文件格式：.${ext}（仅支持 .lakeboard 和 .xmind）`);
  }

  const markdown = renderMarkdown(document, style);
  return { markdown, document };
}
