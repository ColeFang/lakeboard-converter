# lakeboard-converter

[English](./README.md) | 简体中文

一个将语雀画板 `.lakeboard` 思维导图转换为 Markdown 和 XMind 的命令行工具。

## 功能特性

- 解析 `.lakeboard` 文件
- 保留节点层级和原始顺序
- 导出通用 Markdown
- 导出适合 XMind 导入的 Markdown
- 直接生成 `.xmind` 文件

## 环境要求

- Node.js 18+

## 安装

```bash
git clone https://github.com/ColeFang/lakeboard-converter.git
cd lakeboard-converter
npm install
```

## 快速使用

### 导出通用 Markdown

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format md \
  --markdown-style generic
```

默认输出：
- `example.md`

### 导出 XMind 导入友好 Markdown

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format md \
  --markdown-style xmind
```

默认输出：
- `example.xmind-import.md`

### 直接导出 XMind

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format xmind
```

默认输出：
- `example.xmind`

### 同时导出 Markdown 和 XMind

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format both \
  --out-dir ./dist
```

### 覆盖已有文件

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format both \
  --overwrite
```

## CLI 参数

| 参数 | 说明 |
| --- | --- |
| `--format` | 导出格式：`md`、`xmind`、`both` |
| `--markdown-style` | Markdown 风格：`generic` 或 `xmind` |
| `--output` | 单一导出目标的输出文件路径 |
| `--out-dir` | 输出目录 |
| `--overwrite` | 允许覆盖已有文件 |

## 输出格式

### 通用 Markdown
- 根节点输出为一级标题
- 子节点输出为嵌套列表
- 适合 Git、文档系统和通用 Markdown 工具

### XMind 导入友好 Markdown
- 输出为单根节点嵌套列表
- 每个节点单行输出
- 多行文本会压平成单行，便于导入 XMind

### XMind
- 直接生成最小可用 `.xmind` 包
- 包含 `content.json`、`metadata.json` 和 `manifest.json`
- 重点保留文本、层级和顺序

## 开发

```bash
npm run build
npm run typecheck
npm run test
```

## 当前限制

- 当前主要面向 `diagramData.body` 中的思维导图导出
- 保留文本、层级和顺序，但不保留样式、颜色和布局信息
- 如果遇到新的 `.lakeboard` 结构变体，可能需要补充解析逻辑
