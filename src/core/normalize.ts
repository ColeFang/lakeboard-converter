import type { TopicNode } from './types.js';

export function normalizeTree(root: TopicNode): TopicNode {
  const clone = (node: TopicNode): TopicNode => ({
    ...node,
    title: node.title.trim(),
    children: node.children.map(clone),
  });

  return clone(root);
}
