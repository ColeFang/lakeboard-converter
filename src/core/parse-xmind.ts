import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { normalizeTree } from './normalize.js';
import type { MindMapDocument, TopicNode } from './types.js';
import { validateTree } from './validate.js';

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

export async function parseXmindFile(filePath: string): Promise<MindMapDocument> {
  const buffer = await readFile(filePath);
  return parseXmindBuffer(buffer, filePath);
}

export async function parseXmindBuffer(
  buffer: Buffer | ArrayBuffer | Uint8Array,
  sourcePath?: string,
): Promise<MindMapDocument> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new Error('无法解压 .xmind 文件：文件可能已损坏或不是有效的 ZIP 归档');
  }

  const contentFile = zip.file('content.json');
  if (!contentFile) {
    throw new Error('.xmind 文件缺少 content.json，可能是旧版 XMind 8 格式（仅支持 XMind Zen/2020+ 格式）');
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

  return {
    sourcePath,
    format: 'xmind',
    root,
    nodeCount,
    maxDepth,
  };
}
