# lakeboard-converter

English | [简体中文](./README.zh-CN.md)

CLI to convert Yuque Lakeboard `.lakeboard` mind maps into Markdown and XMind.

## Features

- Parse `.lakeboard` files
- Preserve topic hierarchy and ordering
- Export generic Markdown
- Export XMind-friendly Markdown
- Generate `.xmind` files directly

## Requirements

- Node.js 18+

## Install

```bash
git clone https://github.com/ColeFang/lakeboard-converter.git
cd lakeboard-converter
npm install
```

## Quick usage

### Export generic Markdown

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format md \
  --markdown-style generic
```

Default output:
- `example.md`

### Export XMind-friendly Markdown

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format md \
  --markdown-style xmind
```

Default output:
- `example.xmind-import.md`

### Export XMind directly

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format xmind
```

Default output:
- `example.xmind`

### Export both Markdown and XMind

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format both \
  --out-dir ./dist
```

### Overwrite existing files

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format both \
  --overwrite
```

## CLI options

| Option | Description |
| --- | --- |
| `--format` | Output format: `md`, `xmind`, or `both` |
| `--markdown-style` | Markdown style: `generic` or `xmind` |
| `--output` | Output file path for a single export target |
| `--out-dir` | Output directory |
| `--overwrite` | Allow overwriting existing files |

## Output formats

### Generic Markdown
- Root node becomes an H1 heading
- Child nodes become nested lists
- Good for Git, docs, and general Markdown tools

### XMind-friendly Markdown
- Single-root nested list output
- Each topic is rendered on one line
- Multi-line text is flattened for easier XMind import

### XMind
- Generates a minimal `.xmind` package directly
- Includes `content.json`, `metadata.json`, and `manifest.json`
- Focuses on preserving text, hierarchy, and order

## Development

```bash
npm run build
npm run typecheck
npm run test
```

## Limitations

- Preserves text, hierarchy, and order, but not styling, color, or layout
- New `.lakeboard` variants may require parser updates
