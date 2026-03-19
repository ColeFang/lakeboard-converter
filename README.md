# lakeboard-converter

`lakeboard-converter` 是一个面向工程使用场景的命令行工具，用于将语雀画板导出的 `.lakeboard` 思维导图文件转换为两类更通用的交付格式：

- 通用 Markdown
- XMind (`.xmind`)

## 项目背景

语雀画板导出的 `.lakeboard` 文件本质上保留了思维导图的结构数据，但在工程协作、知识库沉淀、版本管理和跨工具流转时，直接使用 `.lakeboard` 并不方便。

典型问题包括：

- 无法直接纳入 Git 仓库做差异对比
- 不方便在 Markdown 知识库、文档系统中复用
- 需要迁移到 XMind 等常用思维导图工具时，缺少稳定的转换链路

本项目的目标是提供一个最小可用、结构清晰的转换工具，将 `.lakeboard` 中的节点内容和层级结构稳定导出到更通用的格式中。

## 功能特性

- 解析 `.lakeboard` JSON 文本格式
- 保留思维导图节点层级和原始顺序
- 导出通用 Markdown 版本
- 导出适合 XMind 导入的 Markdown 版本
- 直接生成 `.xmind` 文件
- 提供命令行接口，便于脚本化调用

## 适用场景

- 将语雀画板思维导图纳入代码仓库管理
- 将思维导图内容同步到 Markdown 文档系统
- 将 `.lakeboard` 批量迁移到 XMind
- 作为后续导入其它知识库或可视化工具的中间转换层

## 环境要求

- Node.js 18+

## 安装依赖

```bash
git clone https://github.com/ColeFang/lakeboard-converter.git
cd lakeboard-converter
npm install
```

## 使用方法

### 1. 导出通用 Markdown

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format md \
  --markdown-style generic
```

默认会在输入文件同目录生成：

- `example.md`

### 2. 导出 XMind 导入友好 Markdown

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format md \
  --markdown-style xmind
```

默认会生成：

- `example.xmind-import.md`

该格式采用单根节点、纯嵌套列表、节点单行输出，更适合导入 XMind。

### 3. 直接导出 XMind

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format xmind
```

默认会生成：

- `example.xmind`

### 4. 同时导出 Markdown 与 XMind

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format both \
  --out-dir ./dist
```

### 5. 覆盖已有文件

```bash
npm run convert -- \
  "/path/to/example.lakeboard" \
  --format both \
  --overwrite
```

## CLI 参数说明

| 参数 | 说明 |
| --- | --- |
| `--format` | 导出格式，支持 `md`、`xmind`、`both` |
| `--markdown-style` | Markdown 风格，支持 `generic`、`xmind` |
| `--output` | 单一导出格式时指定输出文件 |
| `--out-dir` | 指定输出目录 |
| `--overwrite` | 允许覆盖已存在文件 |

## 输出格式说明

### 通用 Markdown

- 根节点输出为一级标题 `#`
- 下级节点输出为嵌套列表
- 适合 Git、Obsidian、Typora、通用 Markdown 阅读器

### XMind 导入友好 Markdown

- 单根节点
- 纯缩进列表
- 每个节点单行输出
- 多行文本会合并为单行，并使用显式分隔符标记原始换行

### XMind

- 直接生成 `.xmind` 包
- 当前版本生成最小可用结构：`content.json`、`metadata.json`、`manifest.json`
- 重点保证节点文本、层级和顺序完整保留

## 开发

```bash
npm run build
npm run test
```

## 测试说明

本项目支持通过本地准备的示例 `.lakeboard` 文件进行验证，建议自行在本地放置通用示例文件后执行测试或命令行验证。

测试关注点包括：

- 解析后的节点数量、根节点名称与层级深度
- Markdown 导出结果是否稳定
- `.xmind` 包结构是否完整

## 当前限制

- 当前以思维导图场景为主，默认从 `diagramData.body` 中提取 `mindmap` 根节点
- 重点保留节点文本和层级，不处理原始样式、颜色、布局象限等画板展示属性
- 若后续遇到新的 `.lakeboard` 结构变体，需要补充解析逻辑
