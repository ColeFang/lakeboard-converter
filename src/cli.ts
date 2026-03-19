#!/usr/bin/env node
import { Command } from 'commander';
import { convertFile } from './index.js';

const program = new Command();

program
  .name('lakeboard-converter')
  .description('将 .lakeboard 文件转换为通用 Markdown 或 XMind')
  .version('0.1.0');

program
  .command('convert')
  .argument('<input>', '输入的 .lakeboard 文件路径')
  .option('-f, --format <format>', '导出格式：md | xmind | both', 'both')
  .option('--markdown-style <style>', 'Markdown 风格：generic | xmind', 'generic')
  .option('-o, --output <path>', '单一导出格式时指定输出文件')
  .option('--out-dir <dir>', '输出目录')
  .option('--overwrite', '允许覆盖已有文件', false)
  .action(async (input, options) => {
    try {
      if (!['md', 'xmind', 'both'].includes(options.format)) {
        throw new Error(`不支持的 format: ${options.format}`);
      }
      if (!['generic', 'xmind'].includes(options.markdownStyle)) {
        throw new Error(`不支持的 markdown-style: ${options.markdownStyle}`);
      }

      const result = await convertFile({
        input,
        format: options.format,
        markdownStyle: options.markdownStyle,
        output: options.output,
        outDir: options.outDir,
        overwrite: options.overwrite,
      });

      console.log(`转换完成：节点 ${result.nodeCount} 个，最大深度 ${result.maxDepth}`);
      for (const output of result.outputs) {
        console.log(`已生成: ${output}`);
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
