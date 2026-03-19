import type { LakeboardDocument } from '../core/types.js';
import { flattenMultilineText } from '../utils/text.js';

function renderGenericNode(lines: string[], title: string, depth: number): void {
  const indent = '  '.repeat(depth);
  if (depth === 0) {
    lines.push(`# ${title}`);
    return;
  }

  const text = title.split('\n');
  lines.push(`${indent}- ${text[0]}`);
  for (const line of text.slice(1)) {
    lines.push(`${indent}  ${line}`);
  }
}

function walkGeneric(lines: string[], node: LakeboardDocument['root'], depth: number): void {
  renderGenericNode(lines, node.title, depth);
  node.children.forEach((child) => walkGeneric(lines, child, depth + 1));
}

function walkXmind(lines: string[], node: LakeboardDocument['root'], depth: number): void {
  const indent = '    '.repeat(depth);
  lines.push(`${indent}- ${flattenMultilineText(node.title)}`);
  node.children.forEach((child) => walkXmind(lines, child, depth + 1));
}

export function renderGenericMarkdown(document: LakeboardDocument): string {
  const lines: string[] = [];
  walkGeneric(lines, document.root, 0);
  return `${lines.join('\n')}\n`;
}

export function renderXmindMarkdown(document: LakeboardDocument): string {
  const lines: string[] = [];
  walkXmind(lines, document.root, 0);
  return `${lines.join('\n')}\n`;
}
