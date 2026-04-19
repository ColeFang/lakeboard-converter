import type { MindMapDocument, TopicNode } from '../core/types.js';
import { flattenMultilineText } from '../utils/text.js';

function renderGenericNode(lines: string[], node: TopicNode, depth: number): void {
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
    lines.push(`${noteIndent}> ${node.notes.split('\n').join(`\n${noteIndent}> `)}`);
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

function walkXmind(lines: string[], node: TopicNode, depth: number): void {
  const indent = '    '.repeat(depth);
  lines.push(`${indent}- ${flattenMultilineText(node.title)}`);
  node.children.forEach((child) => walkXmind(lines, child, depth + 1));
}

export function renderGenericMarkdown(document: MindMapDocument): string {
  const lines: string[] = [];
  walkGeneric(lines, document.root, 0);
  return `${lines.join('\n')}\n`;
}

export function renderXmindMarkdown(document: MindMapDocument): string {
  const lines: string[] = [];
  walkXmind(lines, document.root, 0);
  return `${lines.join('\n')}\n`;
}
