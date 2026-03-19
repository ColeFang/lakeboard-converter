import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { MarkdownStyle } from './core/types.js';
import { parseLakeboardFile } from './core/parse-lakeboard.js';
import { renderGenericMarkdown, renderXmindMarkdown } from './render/markdown.js';
import { renderXmind } from './render/xmind.js';

export interface ConvertResult {
  outputs: string[];
  nodeCount: number;
  maxDepth: number;
}

export interface ConvertInputOptions {
  input: string;
  format: 'md' | 'xmind' | 'both';
  markdownStyle: MarkdownStyle;
  output?: string;
  outDir?: string;
  overwrite?: boolean;
}

async function ensureWritable(filePath: string, overwrite = false): Promise<void> {
  try {
    await stat(filePath);
    if (!overwrite) {
      throw new Error(`输出文件已存在：${filePath}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

function resolveOutputPaths(options: ConvertInputOptions): { mdPath?: string; xmindPath?: string } {
  const parsed = path.parse(options.input);
  const baseDir = options.outDir ? path.resolve(options.outDir) : parsed.dir;
  const baseName = parsed.name;

  if (options.output) {
    const outputPath = path.resolve(options.output);
    if (options.format === 'both') {
      throw new Error('--output 仅支持单一导出格式，请改用 --out-dir');
    }
    return options.format === 'md' ? { mdPath: outputPath } : { xmindPath: outputPath };
  }

  const mdSuffix = options.markdownStyle === 'xmind' ? '.xmind-import.md' : '.md';
  return {
    mdPath: options.format === 'md' || options.format === 'both' ? path.join(baseDir, `${baseName}${mdSuffix}`) : undefined,
    xmindPath: options.format === 'xmind' || options.format === 'both' ? path.join(baseDir, `${baseName}.xmind`) : undefined,
  };
}

export async function convertFile(options: ConvertInputOptions): Promise<ConvertResult> {
  const document = await parseLakeboardFile(options.input);
  const { mdPath, xmindPath } = resolveOutputPaths(options);
  const outputs: string[] = [];

  if (options.outDir) {
    await mkdir(path.resolve(options.outDir), { recursive: true });
  }

  if (mdPath) {
    await ensureWritable(mdPath, options.overwrite);
    const markdown = options.markdownStyle === 'xmind' ? renderXmindMarkdown(document) : renderGenericMarkdown(document);
    await writeFile(mdPath, markdown, 'utf-8');
    outputs.push(mdPath);
  }

  if (xmindPath) {
    await ensureWritable(xmindPath, options.overwrite);
    const xmind = await renderXmind(document);
    await writeFile(xmindPath, xmind);
    outputs.push(xmindPath);
  }

  return {
    outputs,
    nodeCount: document.nodeCount,
    maxDepth: document.maxDepth,
  };
}
