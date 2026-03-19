export interface TopicNode {
  id: string;
  title: string;
  order: number;
  children: TopicNode[];
  rawHtml?: string;
}

export interface LakeboardDocument {
  sourcePath?: string;
  format: 'lakeboard';
  root: TopicNode;
  nodeCount: number;
  maxDepth: number;
}

export type MarkdownStyle = 'generic' | 'xmind';

export interface ConvertOptions {
  overwrite?: boolean;
}
