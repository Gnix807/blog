---
title: 全自动烤肉机使用指南
description: YouTube 视频下载 + WhisperX AI 语音识别 + Netflix 时间码美化 + LLM 机器翻译 + 硬压 — 一条命令从链接生成带双语字幕的视频。
date: 2026-07-13 00:00:00
updated: 2026-07-13 00:00:00
image:
categories: [技术]
tags: [烤肉, 自动化, Whisper, 字幕, 翻译]
references:
  - title: 项目仓库
    link: https://github.com/The-Bazzar/Subtitle-translation
---

# 全自动烤肉机使用指南

## 前言

::alert{type="info"}
**本文档的定位**：这是 Subtitle-translation 项目的操作手册，不是理论教程。如果你对「为什么要这样翻译」「手动烤肉怎么做」感兴趣，请先看[《译制字幕指南》](/2026/things-about-translations)等前几篇。
::

在前面五篇指南里，我们讲了手动烤肉的完整流程——下载视频、听译打轴、字体选择、压制、后期。每一环都要人手动操作，一套下来少则几小时、多则几天。

但如果只想**快速出一版能看的中文字幕**呢？或者作为初译稿、后面再精修？这就是 **Subtitle-translation**（以下简称「自动烤肉机」）的意义。

它能干什么？**一条命令，从 YouTube 链接直达带双语硬字幕的视频文件**：

```text
YouTube 链接 → 下载原片 → WhisperX 语音转文字 → 时间轴美化
→ AI 生成术语表 → LLM 整句翻译 → 智能分割 → 双语校对
→ 生成 ASS → 硬压 burned.mkv
```

这个流程是我和网友一起写的，核心逻辑在 `translate_srt.py` 里，整体通过 `pipeline.ps1`（Windows）或 `pipeline.sh`（Linux）编排。**需要一定命令行基础**，但一旦配好环境，之后就是敲一条命令的事。

::alert{type="warning"}
**环境要求**：Windows 上必须用 **PowerShell 7**（不是旧的 PowerShell 5.x）。升级命令：`winget install Microsoft.PowerShell`
::

## 一、环境准备

### 1. 安装 Python

需要 Python 3.11+。建议通过 `winget` 安装：

```powershell
winget install Python.Python.3.11
```

安装时**勾选「Add Python to PATH」**，否则后续命令找不到 `python`。

### 2. 安装 FFmpeg

```powershell
winget install Gyan.FFmpeg
```

验证：打开 PowerShell 输入 `ffmpeg -version`，看到版本号即成功。

### 3. 安装 GPU 驱动（可选但强烈推荐）

WhisperX 纯 CPU 跑非常慢。有 NVIDIA 显卡的话，确保安装了 CUDA 12.x。

### 4. 拉取项目 + 初始化

```powershell
git clone https://github.com/The-Bazzar/Subtitle-translation.git
cd Subtitle-translation
.\setup.ps1
```

`setup.ps1` 会做三件事：
- 创建虚拟环境 `.venv` 并安装所有 Python 依赖
- 从 `*.example.*` 复制出你的本地配置文件（`.env`、`providers.json` 等）
- 不会覆盖你已经改过的配置

### 5. 配置 LLM 翻译后端

编辑项目里的 `.env`，至少填这两个：

```ini
TRANSLATE_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-你的DeepSeek密钥
```

支持的 provider：`deepseek`（推荐，便宜）、`openai`、`gemini`、`openrouter`、`llama`（本地 Ollama）。

::alert{type="tip"}
**为什么推荐 DeepSeek**：便宜、中文质量好、API 兼容 OpenAI 格式。如果你已经有 OpenAI / Gemini 的 Key，直接改 `TRANSLATE_PROVIDER` 并填对应 Key 即可。
::

## 二、快速开始

配好 `.env` 后，一条命令跑全程：

```powershell
.\pipeline.ps1 "https://www.youtube.com/watch?v=xxxxx"
```

它会依次执行：下载 → 语音识别 → 时间轴美化 → 翻译 → 硬压。最终产物是一个 `burned.mkv`——带双语硬字幕的视频。

如果只想翻译、不想硬压（先看看 ASS 效果）：

```powershell
.\pipeline.ps1 "https://www.youtube.com/watch?v=xxxxx" -SkipBurn
```

如果不想让 AI 联网搜术语（节省 Token）：

```powershell
.\pipeline.ps1 "https://www.youtube.com/watch?v=xxxxx" -SkipKnowledge
```

Linux / WSL 上等价命令：

```bash
./pipeline.sh "https://www.youtube.com/watch?v=xxxxx"
SKIP_BURN=1 ./pipeline.sh "https://www.youtube.com/watch?v=xxxxx"
```

## 三、Pipeline 详细流程

整条流水线分为 7 步。每一步都可以单独跑（方便你中途调试），也可以一键串联。

### 第 1 步：下载原片

```powershell
.\download.ps1 "https://www.youtube.com/watch?v=xxxxx"
```

这一步调用 yt-dlp 下载视频、封面、元数据。下载完成后会把原片保留为 `<name>.original.<ext>`，同时重编码一份**编辑版** `<name>.mp4`（统一格式，方便后续处理）。

### 第 2 步：WhisperX 语音识别

```powershell
.\whisper.ps1
```

对编辑版 `<name>.mp4` 调用 WhisperX，输出 `<name>.json`。这是整条管线的**唯一字幕输入源**——之后所有时间轴操作都基于这个 JSON 里的 `words[]`（词级时间戳）。

::alert{type="warning"}
**需要 GPU！** CPU 模式下跑一个 15 分钟的视频可能需要 30 分钟以上。确认你的 `.env` 里 `WHISPER_DEVICE=cuda`（NVIDIA 卡）并且装好了 CUDA。
::

### 第 3 步：时间轴美化

```powershell
.\.venv\Scripts\python.exe translate_srt.py <name>.json --video <name>.mp4 --only-beautify
```

WhisperX 给出的词级时间戳有时不够平滑——词和词之间可能有空隙、边界不齐。这一步会**吸附修复**词级时间轴，让字幕切分更干净。输出：
- `<name>.beautified.json`：美化后的主缓存
- `<name>.scenes.json` / `<name>.scenechange.txt`：场景切换信息

### 第 4 步：生成术语表（可选）

```powershell
.\.venv\Scripts\python.exe translate_srt.py <name>.beautified.json --only-glossary
```

AI 读取整段 transcript 和视频元数据，自动生成 `glossary.md`——人名、地名、专业术语的对照表。如果你配了 Tavily 搜索（`TAVILY_API_KEY`），还会联网验证可能被 ASR 误识别的内容。

### 第 5 步：整句翻译 + 分割 + 校对

```powershell
.\.venv\Scripts\python.exe translate_srt.py <name>.beautified.json --video <name>.mp4
```

这是核心步骤。`translate_srt.py` 会：

1. **整句翻译**：用 LLM 把整段 transcript 翻译成中文，靠 Glossary 术语表保证一致性
2. **智能分割**：长句自动拆分（默认超过 72 字符或 3.8 秒的句子会触发分割），分割后用词级时间戳回填每条字幕的起止时间
3. **双语校对**：对已分割的字幕事件做最终校对

输出产物包括双语 ASS、源语言 ASS、目标语言 ASS。

::folding{title="如果你不需要分割（保留整句对照）"}
```powershell
.\.venv\Scripts\python.exe translate_srt.py <name>.beautified.json --video <name>.mp4 --no-split
```
::

### 第 6 步：硬压字幕

```powershell
.\ffmpeg-burn.ps1
```

使用 ffmpeg 将第 5 步生成的双语 `.ass` 烧录进视频。默认用**原片**（不是编辑版）压制，保证画质。

### 第 7 步（可选）：mpv 预览压制效果

```powershell
.\mpv-burn.ps1
```

用 mpv 播放器加载双语 ASS 预览效果，适合调样式时快速迭代。

## 四、配置详解

### `.env` 主要变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `WHISPER_MODEL` | WhisperX 模型 | `large-v3-turbo` |
| `WHISPER_DEVICE` | 推理设备 `cuda`/`cpu` | 自动 |
| `SOURCE_LANG` | 源语言（空=自动检测） | 空 |
| `TARGET_LANG` | 目标语言 | `zh` |
| `TRANSLATE_PROVIDER` | 翻译后端 | `deepseek` |
| `DEEPSEEK_API_KEY` | DeepSeek Key | 必填 |
| `OPENAI_API_KEY` | OpenAI Key | 选填 |
| `HF_TOKEN` | HuggingFace Token | 选填 |

### 自定义 Prompt

项目里有一组 `*_prompt.md` 文件，可以微调 AI 的行为：

| 文件 | 作用 |
|---|---|
| `glossary_prompt.md` | 术语表生成策略 |
| `translate_prompt.md` | 翻译风格 |
| `proofread_prompt.md` | 校对策略 |
| `split_prompt.md` | 分割风格 |

这些文件支持 `${SOURCE_LANG}`、`${TARGET_LANG}` 等模板变量。改完后重新跑翻译步骤即可生效，不需要改代码。

### 模板变量参考

- `${SOURCE_LANG}` — 源语言名称（如 `English`）
- `${TARGET_LANG}` — 目标语言名称（如 `Chinese Simplified`）
- `${SOURCE_LANG_CODE}` — 源语言 ISO 代码（如 `en`）
- `${TARGET_LANG_CODE}` — 目标语言 ISO 代码（如 `zh`）

## 五、常见问题

**Q：WhisperX 报 CUDA 错误？**

确保显卡驱动和 CUDA 12.x 已安装，`.env` 里 `WHISPER_DEVICE=cuda`。如果实在没有 N 卡，设 `WHISPER_DEVICE=cpu`，但做好等很久的准备。

**Q：翻译结果里人名/术语全是错的？**

跑一遍第 4 步（`--only-glossary`），有术语表之后翻译会准很多。另外去 `glossary_prompt.md` 里加上你关注领域的提示词也会有帮助。

**Q：ASS 字幕样式不满意？**

编辑项目里的 `template.ass`（双语模板），改字体、字号、颜色、位置等。修改后重新跑翻译 + 压制即可看到效果。

**Q：我只想要 ASS 字幕文件，不想硬压？**

```powershell
.\pipeline.ps1 "https://..." -SkipBurn
```
产物里有双语 `.ass`，你可以用其他播放器外挂字幕观看，或导入视频编辑软件。

**Q：想处理本地视频文件，不是 YouTube？**

直接跳到第 2 步，手动跑 `.\whisper.ps1`（只要你的视频是 `<name>.mp4` 就行），然后继续后续步骤。

**Q：DeepSeek 翻译太慢了？**

DeepSeek 的免费 API 有速率限制。可以考虑切换到 `openai` 或 `openrouter`，或者用本地 Ollama（`TRANSLATE_PROVIDER=llama`）。

## 六、命令速查表

| 操作 | 命令 |
|---|---|
| 一键全流程 | `.\pipeline.ps1 "URL"` |
| 跳过硬压 | `.\pipeline.ps1 "URL" -SkipBurn` |
| 跳过术语表 | `.\pipeline.ps1 "URL" -SkipKnowledge` |
| 单独下载 | `.\download.ps1 "URL"` |
| 单独识别 | `.\whisper.ps1` |
| 单独美化 | `python translate_srt.py x.json --only-beautify` |
| 单独翻译 | `python translate_srt.py x.beautified.json --video x.mp4` |
| 不分句（保留整句） | `python translate_srt.py x.json --video x.mp4 --no-split` |
| 单独硬压 | `.\ffmpeg-burn.ps1` |
| 重置配置 | 删 `.env` 后重跑 `.\setup.ps1` |

## 写在最后

这个工具代表了一种思路：**把重复劳动交给机器，把创造力留给自己**。它不能替代你对翻译质量、文化适配、语气把握的判断——但它能把你从「听写 + 打轴 + 格式转换」这些纯体力活里解放出来。如果你觉得跑出来的初稿质量不错，可以直接发布；如果想精修，用这版当底稿再改，也省了一大半时间。有问题或建议，欢迎来[项目仓库](https://github.com/The-Bazzar/Subtitle-translation)提 Issue 或 PR。
