import type { TopicNode } from './types.js';

export interface ValidationResult {
  nodeCount: number;
  maxDepth: number;
}

export function validateTree(root: TopicNode): ValidationResult {
  const ids = new Set<string>();
  let nodeCount = 0;
  let maxDepth = 0;

  const visit = (node: TopicNode, depth: number): void => {
    if (ids.has(node.id)) {
      throw new Error(`发现重复节点 id: ${node.id}`);
    }

    ids.add(node.id);
    nodeCount += 1;
    maxDepth = Math.max(maxDepth, depth);

    node.children.forEach((child, index) => {
      if (child.order !== index) {
        throw new Error(`节点 ${child.id} 的顺序字段异常，期望 ${index}，实际 ${child.order}`);
      }
      visit(child, depth + 1);
    });
  };

  visit(root, 0);

  return { nodeCount, maxDepth };
}
