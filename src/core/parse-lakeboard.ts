import { readFile } from 'node:fs/promises';
import { normalizeTree } from './normalize.js';
import type { LakeboardDocument, TopicNode } from './types.js';
import { validateTree } from './validate.js';
import { normalizeInlineText } from '../utils/text.js';

interface RawNode {
  id?: string;
  html?: string;
  children?: RawNode[];
  type?: string;
}

interface RawLakeboardFile {
  format?: string;
  diagramData?: {
    body?: RawNode[];
  };
}

function convertNode(node: RawNode, order: number): TopicNode {
  return {
    id: node.id ?? `node-${order}`,
    title: normalizeInlineText(node.html ?? '') || '(untitled)',
    order,
    rawHtml: node.html,
    children: (node.children ?? []).map((child, index) => convertNode(child, index)),
  };
}

export async function parseLakeboardFile(filePath: string): Promise<LakeboardDocument> {
  const content = await readFile(filePath, 'utf-8');
  let data: RawLakeboardFile;

  try {
    data = JSON.parse(content) as RawLakeboardFile;
  } catch (error) {
    throw new Error(`无法解析 .lakeboard 文件：${error instanceof Error ? error.message : String(error)}`);
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

  const root = normalizeTree(convertNode(rootRaw, 0));
  const { nodeCount, maxDepth } = validateTree(root);

  return {
    sourcePath: filePath,
    format: 'lakeboard',
    root,
    nodeCount,
    maxDepth,
  };
}
