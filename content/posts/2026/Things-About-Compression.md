---
title: 视频压制指南
description: 从 FFmpeg 命令行的转码底层逻辑，到 HandBrake、小丸工具箱等图形前端 — 一份把字幕烧录进画面、平衡体积与画质的硬核压制手册。
date: 2026-07-12 14:40:00
updated: 2026-07-12 14:40:00
image:
categories: [技术]
tags: [烤肉, 压制, FFmpeg, HandBrake]
references:
  - title: 在线查看原网页
    link: https://www.gnix807.cn/docs/Tutorials/Translations/Compression
---

# 视频压制指南

## 引言

在完成视频翻译和字幕打轴后，最后一步就是"压制"。硬字幕的压制是个漫长的话题。压制的核心目的是在**文件体积**和**画面质量**之间找到最佳平衡，并将字幕（尤其是带有卡拉OK等复杂效果的 ASS 特效字幕）永久烧录进视频画面中。

本文档将首先从音视频处理领域的底层架构——**FFmpeg 命令行开源程序**入手，深度解析转码的核心逻辑、关键参数与工业级滤镜调用；随后，针对不同应用场景下的效率需求，对主流的图形用户界面（GUI）前端套件（如高度现代化的 `HandBrake` 与经典的 x264 封装器 `小丸工具箱`）进行操作说明。

## 一、FFmpeg入门

### 1.FFmpeg引言

FFmpeg是一个伟大的工具，无需多言。它是整个音视频处理领域的基石，绝大多数视窗化压制软件的底层都依赖它。掌握基础的命令行压制，可以为你提供最高的自定义程度和批处理效率。

::pic
---
src: https://img.gnix807.cn/%E4%B8%8B%E8%BD%BD%20(2).png
caption: 图片毫不夸张地解释了FFmpeg对于现代互联网基础设施的重要性
---
::

#### 安装

::alert{type="info"}
*注：本小节的内容以 Windows 用户为例。*
::

前往 FFmpeg 官网建议的 [Windows 版本的已编译文件 (gyan.dev)](https://www.gyan.dev/ffmpeg/builds/#release-builds) 进行下载，或者在 [FFmpeg 官网下载页](https://ffmpeg.org/download.html#build-windows) 选择其他编译版本。一般在下载时选择 release 版本、 标记组件为 full 的版本进行下载。

下载完成后，将内容解压到你的硬盘某处，例如：`C:\FFmpeg`。如果之前安装过独立的 FFmpeg，可以覆盖到老版本的文件夹。之后，将安装路径添加到系统的 Path 环境变量。

最后，检查是否能从命令行正常启动。打开 PowerShell，输入：

```powershell
ffmpeg
```

来查看返回的版本号是否与你下载的一致。

- 如果你的电脑上安装了多个 FFmpeg（有时候其他软件会安装 FFmpeg 作为基础组件），可以通过 `(Get-Command ffmpeg).source` 来查看被调用的 FFmpeg 路径，以确认是否调用了希望调用的 FFmpeg。
- 如果 `ffmpeg` 命令调用了别处的 FFmpeg，你可以考虑将刚安装的 FFmpeg 的路径移动到 Path 环境变量列表中的靠前的位置，使 Windows 在查找设备上的 FFmpeg 时优先寻到这个版本。

#### 基本视频概念

在介绍 FFmpeg 的工作命令之前，我们首先对视频文件内部的一些概念做一个通俗的说明。注意： *以下的说明可能存在不准确之处，仅作大致理解用。*

- **流**（stream）：通常的视频文件中最易见的是视频流与音频流两个流。部分视频文件（多为 mkv 文件）还有字幕流，即内挂字幕。注意，有的视频将字幕嵌入到了视频流中（内嵌字幕），这类视频没有字幕流，也无法提取出字幕文件。至于数据流，本文不作介绍。
  - **码率/比特率**（bitrate）：衡量流的数据量的标准。高码率的视频、音频携带了比低码率更多的数据，在压制时（允许的）损失较小，因此它们的质量一般更高。例如，128 kbps 的 MP3 音频的听感效果一般比 64 kbps 的好。
  - **分流/混流**（mux/demux）：将多个流从一个视频文件中对应地抽取出来，称为分流。反之，将多个流整理后写入某个文件，称为混流。
  - **容器**（container）：可以粗略地理解为某种扩展名类型的视频文件。比如 MP4 是一种容器，MKV 是另一种容器。
- **编码/解码**（encode/decode）：将流用某种格式或规范记录下来并存储，称为编码；将编码后的流，根据格式或规范来逆向实现编码的过程，从而将流还原出来，称为解码。我们最经常听到的规范大概是 H.264，最常见到的编码器可能是 libx264。

#### 色深与色度采样

在很长的一段时间内，8 bit 色深、4:2:0 色度采样是最常见的视频像素格式。

- **色深位**（bit）：该概念与图片中颜色分级的位概念一致。在很长一段时间内，最广泛使用的颜色分级会把纯黑到纯白的灰阶分成 256 级，因此叫 8 位（因为 2^8=256）色深。8 bit 的视频也是最广为使用的。我们预期 10 bit 将继任；但目前 10 bit（甚至更高）色深主要在录制设备上应用，而在播放设备（显示屏等）上的普及尚远。
- **色度采样**（chroma sampling）：视频在录制或编码时，我们常逐个记录像素的明度、而采样式地（非逐个）记录像素的色度，以此减小视频大小。这种方式称为 YCrCb，其中 Y 表示明度，Cr 与 Cb 用于记录色度（红色与蓝色的偏移量）。

  色度采样方式常常使用 x:y:z 的方式来表示，如 4:2:0。这种记法表示在 4 个像素宽、2像素高的区域中，每行对 x 个像素进行亮度采样。x 通常是 4，也就是全像素亮度记录。而 y 与 z 分别代表第一行与第二行的采样数。例如，4:2:2 表示在两行中均只对 2 个像素采样色度（剩余像素的色度由采样速度推断），因此实际只使用了这 8 个像素中 4 个像素的色度信息，即丢失了 50% 的色度。同理，4:2:0 在第一行对 2 像素色度采样、不在第二行色度采样，因此丢失了 75% 的色度信息。最后，4:4:4 表示对全像素记录色度。

在 FFmpeg 中，可以使用 `ffmpg -pix_fmts` 来查看 FFmpeg 支持的所有像素格式。

#### 常用的编码格式

FFmpeg 支持基本所有的主流编码格式。

常用的视频编码格式有：

- [H.264](https://trac.ffmpeg.org/wiki/Encode/H.264) 是上一代最广为使用的视频编码格式，始于 2003 年，当之无愧的一代霸主。在 FFmpeg 中可由 `libx264` 编码器支持。
- [H.265](https://trac.ffmpeg.org/wiki/Encode/H.265) （或称 HEVC） 是 H.264 的接任者，于 2013 年正式面世。它在同等视频质量下提供了相比 H.264 而言可达 50% 的体积缩减。 `libx265` 编码器对该编码格式提供了支持。
- [VP9](https://trac.ffmpeg.org/wiki/Encode/VP9) 经历了从 VP3 起漫长的版本迭代，VP 系列解码器的开发公司 On2 被谷歌收购。谷歌在 2013 年左右推出了取代上一代 VP8 编码的 VP9，主要为旗下的互联网视频平台 YouTube 所采用。
- [AV1](https://trac.ffmpeg.org/wiki/Encode/AV1) (AOMedia Video 1) 是 H.265 的免版税竞争者，极大地基于 VP9 的技术，并在 VP9 的基础上提供了惊人的压缩比率。其开发联盟由诸多互联网公司支持，并受到主流浏览器 Chrome 与 Firefox 的积极推动。它在 FFmpeg 中由 `libsvtav1`（以及原来的 `libaom-av1` ）编码器对该编码格式提供支持。

::pic
---
src: https://img.gnix807.cn/Compare.png
caption: AV1、x265、VP9 等主流编码器的平均压缩比
---
::

### 2.FFmpeg 实用命令

FFmpeg的[官方文档](https://ffmpeg.org/ffmpeg.html)简洁有力，但它的排版逻辑是技术文档而不是工具书或问答，因此可能并不是一个好的参阅选择。

本文将以实际用例为主。毕竟照搬 FFmpeg 的文档实在没有什么意义。本文主要集中于视频压制方面的用例，是由浅入深的，不过如果读者没有任何的 FFmpeg 使用经验，仍然建议按顺序依次浏览。

在开始之前，先介绍一个全局参数 `-hide_banner`；它可以阻止 FFmpeg 在每次执行时开头打印的那一堆版本信息文本。例如，在展示 FFmpeg 的许可证时，隐藏这部分默认打印的版本信息：

```powershell
ffmpeg -hide_banner -L
```

#### 字幕操作

FFmpeg 可以将字幕内挂到封装容器内，也可以内嵌到视频流中。

一些注意事项：

- 独立的字幕文件请使用 UTF-8 编码。
- Windows 系统可能缺少一个字体接口，需要自己配置一份 `fonts.conf` 文件，并放在 `%FONTCONFIG_PATH%` 这个环境变量对应的路径下。
  - 如果用户没有该变量，请新建一个；其默认值一般是 `C:\Users\用户名\` 。
  - 关于 `fonts.conf` 文件，请参考本文末尾的附录。

##### 内挂字幕

内挂字幕是一种相对于外挂字幕的称呼。外挂字幕是指将字幕存放在一个独立的字幕文件中，在播放视频时，通过视频播放器来加载这个字幕文件。而内挂字幕，是将这样一个独立的"字幕文件"，封装在了视频文件内部作为独立的字幕数据流。这样既能按需开启或关闭字幕，也免去了字幕文件丢失、匹配等烦恼。

内挂字幕的本质是将字幕文件单独作为字幕流封装，因此不需要对视频流进行编码。因此，将字幕文件内挂到指定的视频一般非常快：

```powershell
ffmpeg -i input.mp4 -i input.srt -c:v copy -c:a copy -c:s ass output.mkv
```

这里面 `input.mp4` 是未添加字幕的视频的名字（以及路径），`input.srt` 文件是所要挂载的字幕，`output.mkv` 是输出视频的文件名。

在封装时，一般需要选择 `-c:s ass` 这个字幕转码器。上例中使用了早年间非常流行的内挂字幕容器 mkv，实际上 mp4 容器也可以进行内挂操作。

要从有字幕流的视频文件中移除字幕，可以使用 `-sn` 参数，在此不做赘述。

###### 内挂字幕的元数据操作

FFmpeg 支持以元数据（metadata）的形式指定流的信息，这也包括字幕流（内挂字幕）。其中，比较常用的元数据可能是指定字幕的语言。下例向一个无字幕的视频文件中添加了一个 ass 字幕文件，并指定其语言为中文（语言码应遵循 ISO639-2 标准的三位代码，例如英文 eng、日文 jpn）：

```powershell
ffmpeg -i input.mp4 -i input.ass -c:v copy -c:a copy -c:s ass -metadata:s:s:0 language=chi output.mkv
```

##### 内嵌字幕

内嵌字幕（或称硬字幕）是指将字幕与原视频图像混叠的一种字幕，它直接嵌入到图像中，因此无法关闭，也无法调整字幕的大小、字体等样式。内嵌字幕的本质是将字幕作为图像输出，因此需要对视频流进行编码，往往速度慢：

```powershell
ffmpeg -i input.mp4 -vf subtitles=input.srt output.mp4
```

这里面 `input.mp4` 是未添加硬字幕的视频的名字（以及路径），`input.srt/ass` 文件是所要压制的字幕，`output.mp4` 是输出的硬字幕视频的文件名。

如果字幕以字幕流的形式存在于另一个视频文件中，可以直接调用，无需将字幕流先提取成文件：

```powershell
ffmpeg -i input.mkv -vf subtitles=input.mkv output.mp4
```

#### 压制与码率

::alert{type="tip"}
备注

在大多数压制场合，CRF都是更受欢迎的，也是保持画面质量的一选。如果要严格限制文件大小，那么就使用二压；如果要严格限制视频码率，才会考虑使用定限码率压制（或者二压）。
::

::alert{type="warning"}
本节以下的例子将以 libx264 编码器为例，并只是进行了粗略的介绍。关于编码器的更多详细内容，请参阅官方文档。
::

视频的压制主要有 CRF（Constant Rate Factor，恒定率系数）与二压（2Pass）两种常用的方法，以及定限码率压制这种相对不常用的方法（不太推荐）：

- **在编码器 libx264/libx265 中（vp9等其他编码器中的情形并不同）** ，CRF（Constant Rate Factor）指定一个 0~51 的数值作为视频质量标准值（FFmpeg 中，libx264 默认 23，常用范围是 17~28；libx265 默认 28）。CRF 的数值越小，恒定率系数越好，压缩率也越低。恒定律系数的视频码率是根据画面动态调整的，与恒定码率（CBR）恰好是对立的。
  - CRF 为 0 表示无损，51 表示 FFmpeg 所能达到的最差效果。
  - 如果设置一个小于默认值 23 的值，那么输出视频的画面会（从视觉观感上）保留较好的效果，但同时文件的体积也较大；如果设置一个大于 23 的值，那么输出的视频大小会被压缩，但会在画面观感上有一定损失。
  - 对于 H.264 编码，CRF 在 17 左右时，输出的视频损失就非常小了，因此选择比 17 更小的 CRF 意义不大；类似地，CRF 如果大于 28，其效果相比于原视频可能就会出现明显的损失，因此通常也不建议选择大于 28 的数值，
- 二压（2Pass）是需要生成固定大小文件时的压制方法，顾名思义，需要编码两次（因此较慢）。用户可能需要自行计算视频码率限值。
- 定限码率（Limited bitrate）压制是仅在网络上传有严苛要求时才使用的方法，并不是画面质量的第一选择。

##### 恒定率系数（CRF）

除 `-crf` 外，CRF 的压制中还有一个参数，称为预案 `-preset` 。较慢的预案能够更好地发挥压制的效果，按压制后质量从低到高分为 `ultrafast` , `superfast` , `veryfast` , `faster` , `fast` , `medium` , `slow` , `slower` , `veryslow` 这9种。预案越慢，压缩效果（指视频质量与文件体积之比）越好，或者说同等视频质量下输出文件的体积越小。

下例中使用了 `slow` 预案来进行压制，即期望得到较好的压缩效果。视频编解码器设置为 libx264，设定了一个恒定率系数优于默认的 CRF 值（设定的20比默认的23小，即效果优于默认转码），并对音频流进行复制：

```powershell
ffmpeg -i video.mp4 -c:v libx264 -preset slow -crf 20 -c:a copy out.mp4
```

编码器 `libx264` 还提供了一个 `-qp` 参数，即量化参数（Quantization Parameter）。它可以取 -1 以上的整数值（默认值 -1 表示自动）。简单地理解，CRF 就是自动根据画面中运动的多与少来调整 QP ，来达到好的压缩效果。通常情况下，用户都应当选择 CRF，而不是 QP 参数。

##### 二压（2Pass）

::alert{type="tip"}
备注

通常只在强制要求文件大小时使用二压。
::

设想一个针对哔哩哔哩平台的二压规避场景：你需要将一期 15 分钟（900 秒）长的视频，精确压制到 500 MB 以内，以确保处于平台最优先的处理权重区间。同时，为了保证原声与特效音的清晰度，需保持音频码率在 192 kbps。

首先计算压制后视频流的比特率值。已知 1 MB = 8192 kbit，下式的第一项即为目标总文件的理论平均比特率，减去第二项音频流的比特率，即可推导出视频流的可用比特率上限：

`(500 × 8192) / 900 − 192 ≈ 4551 − 192 = 4359 kbit/s`

在工程实践中，由于封装容器（如 MP4 的 Metadata 头部信息）会产生微小的额外体积开销，且 2Pass 在处理极复杂动态画面时仍有极小概率发生码率微小上浮。因此，必须在上式 4359 kbit/s 的基础上预留安全余量，通常建议向下取整，例如将其设置为 4300 kbit/s。

::alert{type="warning"}
如果 first pass 后的文件出现了问题，请使用 `-vsync cfr` 代替 `-an`。
::

```powershell
# 对于 H.264 二压，使用 -pass 参数。请注意首行行尾的续行。
ffmpeg -y -i video.mp4 -c:v libx264 -b:v 4300k -pass 1 -an -f null NUL && `
ffmpeg -i video.mp4 -c:v libx264 -b:v 4300k -pass 2 -c:a aac -b:a 192k out.mp4

# 对于 H.265 二压，则应使用 -x265-params 参数。同样，请注意首行行尾的续行。
ffmpeg -y -i video.mp4 -c:v libx265 -b:v 4300k -x265-params pass=1 -an -f null NUL && `
ffmpeg -i video.mp4 -c:v libx265 -b:v 4300k -pass 2 -c:a aac -b:a 192k out.mp4
```

大部分参数比较好理解，需要说明的是这几个参数：

- `-y` 是一个全局参数，表示覆盖文件时不询问。
- `NUL` 表示二压的第一步不输出，而行尾的符号表示续行。
  - 如果使用 CMD 而不是 Powershell，请使用 `^` 代替首行行尾的续行符。
  - 在 Linux 系统上，请使用 `/dev/null` 代替 NUL，并使用 `\` 代替首行行尾的续行符。
- `-an` 表示忽略音频流。同理还有 `-vn/sn/dn`。

##### 定限码率压制

定限码率压制并不考虑文件大小，而是只限制文件码率；这多见于网络上传视频（或者流媒体传输受到网络条件限制）的场合（参考 [Limiting the output bitrate](https://trac.ffmpeg.org/wiki/Limiting%20the%20output%20bitrate)）。以 libx264/libx265 编码器为例，有以下几种码率限制参数：

- `-b:v` 目标平均码率，也即希望得到的输出文件的平均码率（单位 bit/s）。该参数也在二压中被使用。

  值得说明的是，输出视频的码率总是大于指定的平均码率的。这是由于容器本身还需要记录元数据等内容（可能占用数百 KB），因此我们总是需要对传入码率参数进行调低。这个码率超出问题在压制短时长视频压制时比较明显，请特别注意。
- `-maxrate` 最大码率，需要与 `-bufsize` 参数同时使用。
- `-minrate` 最小码率。这个较少使用。

只给定平均码率 `-b:v` 是一种比较粗糙的码率控制方法。正如上面所说，它会使得输出文件的码率总是略高于指定值。

```powershell
ffmpeg -i input -c:v libx264 -b:v 8M output.mp4
```

相对的，利用最大码率参数 `-maxrate` 与缓冲区参数 `-bufsize` 可以更严格地控制码率上限。它会完成一段缓冲区大小就检验一次码率是否符合要求，因此在缓冲区设置上也存在一些技巧。通常，我们将缓冲区设置为与码率值相同。你也可以增大缓冲区，直到发现码率输出开始大幅度高于或低于目标值的临界点，然后以略低于该临界点的值作为缓冲区大小；当然，这需要更多的时间去尝试。

```powershell
ffmpeg -i input -c:v libx264 -b:v 8M -maxrate 8M -bufsize 8M output.mp4
```

关于如何兼顾质量与文件体积，很难对"合适"的码率作出一个精确的定义。在这里只简单引用一下 [YouTube 码率建议表](https://support.google.com/youtube/answer/1722171?hl=en#zippy=%2Cbitrate)供大家参考：

- 表中码率的推荐值基于 H.264 编码。
- 表中推荐高帧率视频使用同规格低帧率 1.5 倍的码率，而 HDR 使用 SDR 1.25 倍的码率。

| 规格 | 帧率 | 推荐码率（SDR） | 推荐码率（HDR） |
| --- | --- | --- | --- |
| 8K | 24~30 | 80 - 160 Mbps | 100 - 200 Mbps |
| 8K | 48~60 | 120 - 240 Mbps | 150 - 300 Mbps |
| 4K (2160p) | 24~30 | 35 - 45 Mbps | 44 - 56 Mbps |
| 4K (2160p) | 48~60 | 53 - 68 Mbps | 66 - 85 Mbps |
| 2K (1440p) | 24~30 | 16 Mbps | 20 Mbps |
| 2K (1440p) | 48~60 | 24 Mbps | 30 Mbps |
| 1080p | 24~30 | 8 Mbps | 10 Mbps |
| 1080p | 48~60 | 12 Mbps | 15 Mbps |
| 720p | 24~30 | 5 Mbps | 6.5 Mbps |
| 720p | 48~60 | 7.5 Mbps | 9.5 Mbps |

YouTube 的音频码率推荐则为单声道 128 Kbps、环绕声 384 Kbps 以及 5.1 声道 512 Kbps.

#### 附录：fonts.conf

本文件来源于 [FiveYellowMice/how-to-convert-videos-with-ffmpeg-zh](https://github.com/FiveYellowMice/how-to-convert-videos-with-ffmpeg-zh/blob/master/etc/fontconfig-windows/fonts.conf) 仓库。

::folding{title="展开 fonts.conf 完整内容"}
```xml
<?xml version="1.0"?>
<fontconfig>

<dir>C:\WINDOWS\Fonts</dir>

<match target="pattern">
<test qual="any" name="family"><string>mono</string></test>
<edit name="family" mode="assign"><string>monospace</string></edit>
</match>

<match target="pattern">
<test qual="all" name="family" compare="not_eq"><string>sans-serif</string></test>
<test qual="all" name="family" compare="not_eq"><string>serif</string></test>
<test qual="all" name="family" compare="not_eq"><string>monospace</string></test>
<edit name="family" mode="append_last"><string>sans-serif</string></edit>
</match>

<alias>
<family>Times</family>
<prefer><family>Times New Roman</family></prefer>
<default><family>serif</family></default>
</alias>
<alias>
<family>Helvetica</family>
<prefer><family>Arial</family></prefer>
<default><family>sans</family></default>
</alias>
<alias>
<family>Courier</family>
<prefer><family>Courier New</family></prefer>
<default><family>monospace</family></default>
</alias>
<alias>
<family>serif</family>
<prefer><family>Times New Roman</family></prefer>
</alias>
<alias>
<family>sans</family>
<prefer><family>Arial</family></prefer>
</alias>
<alias>
<family>monospace</family>
<prefer><family>Andale Mono</family></prefer>
</alias>
<match target="pattern">
<test name="family" compare="eq">
<string>Courier New</string>
</test>
<edit name="family" mode="prepend">
<string>monospace</string>
</edit>
</match>
<match target="pattern">
<test name="family" compare="eq">
<string>Courier</string>
</test>
<edit name="family" mode="prepend">
<string>monospace</string>
</edit>
</match>

</fontconfig>
```
::

## 二、HandBrake

### 1.简介

这是一款全桌面平台的开源免费软件，在 Windows、macOS、Linux 下均有对应的应用程序界面。

HandBrake 基于鼎鼎大名的 FFmpeg 多媒体框架。FFmpeg 本身是命令行程序，可以这么理解：HandBrake 是为方便调用 FFmpeg 而开发的用户友好界面。

下载地址：[点击跳转](https://handbrake.fr/)

::alert{type="warning"}
HandBrake 仅能用于视频转码压制，不提供视频剪辑和特效等功能！
::

### 2.快速入门

> 适合首次接触视频压制，并且时间紧迫、任务繁重的你

#### 1.导入源视频

::pic
---
src: https://img.gnix807.cn/a16364b2-e92d-4617-b7be-38f639b2458c.png
caption: 导入源视频
---
::

软件启动后或手动点击 `打开源` 即可导入视频，可以选择：

- 导入单个视频
- 或指定文件夹，自动批量扫描导入多个视频

#### 2.选择预设，设定输出文件保存位置和文件名

::pic
---
src: https://img.gnix807.cn/a000ffba-b3f2-4ad0-b704-c165bd63d328.png
caption: 选择预设与输出设置
---
::

- 单个视频：
  - 点击 `预设`；
  - 点击 `Very Fast 720p30`（默认为 `Fast 1080p30`）；
  - 确保输出格式为 `MP4`；
  - 点击 浏览 设定保存位置。
- 批量视频：
  - 参照上述设置。
  - 另外，可在 `标题` 中逐个选择、编辑并 `添加到队列中`。
  - 或在设置首个视频后，点击 `添加到队列中` 下拉菜单中的 `全部添加`，将自动应用第一个视频的参数到所有视频并全部添加到队列。

#### 3.开始压制

- 单个视频：
  - 点击 `开始编码`。
- 批量视频：
  - 点击 `启动队列`。

#### 4.进阶使用

花几分钟制作一个自己的预设是值得的。你可能会需要调节以下参数：

1. 勾选"摘要"页面中的"网页优化"复选框，这可以支持渐进式下载（方便观众在线观看的时候，在视频的不同地方之间来回跳转）（其实视频平台二压也会这么做？）
2. 调整"尺寸"页面中的"分辨率限制"，以符合上传需求。不要将这里的分辨率设置为超过原视频分辨率。
3. 如果原视频有画质缺陷，在"滤镜"页面中有一些调节的选项。具体选项对应的功能，以及同一功能下不同算法的优劣和适用范围，在网上都能搜索到。如果缺陷在原本观看时并不存在，可能是之前的压制出了问题，回头调整那里的参数可能会更快。
4. "视频"页面中有许多非常重要的参数。例如视频编码器，帧率，质量，编码器预设，等等。下图是我的硬件组合里可选的所有编码器，其中许多是软件编码器，而带有 AMD VCE 或是 NVEnc 等字样的是硬件加速编码器。硬件加速编码器使用专用硬件，通常由 GPU 提供。软件编码器仅运行在 CPU 上。硬件编码器通常会牺牲极少量的细节换来巨大的速度提升。

   ::pic
   ---
   src: https://img.gnix807.cn/%E4%B8%8B%E8%BD%BD%20(3).png
   caption: 可选的所有编码器
   ---
   ::

5. 如果你看到了"编码器级别"和"编码器预设"选项，并且里面有不止一个选项可以调节，请参考[该帖子](https://www.reddit.com/r/handbrake/comments/b8yzd3/i_cant_understand_what_encoder_level_is/)。若嫌太长不看，就全都放到默认设置或是 Auto 上去。
6. 笔者常用的编码器预设（请注意帧率由原视频决定，并且小数点级别的差别在这里很重要。每次进行压制之前都务必检查视频帧率！）：

   ::pic
   ---
   src: https://img.gnix807.cn/%E4%B8%8B%E8%BD%BD%20(4).png
   caption: 笔者常用的编码器预设
   ---
   ::

7. 在"音频"页面中，请尽量选择"编码"一行带有Passthru字样的选项。本教程所示范的过程会在 ffmpeg 中转换一次音频编码为 aac（出于方便和兼容性考虑），再次压缩有损音频可能会影响音频质量。Passthru 选项会原封不动地保留原本的 aac 音频，省去一次压缩。如果你对音频质量有要求，请在工作流的一开始就选择最合适的音频文件下载，并不做任何转化（ffmpeg 参数为：`-acodec copy` ），或是进行最少次数的无损格式转换。

   ::pic
   ---
   src: https://img.gnix807.cn/%E4%B8%8B%E8%BD%BD%20(5).png
   caption: 音频页面设置
   ---
   ::

8. 在"字幕"页面中，删除默认的轨道（右边有灰色小叉，也可以点按右上角"清除"按钮），之后选择左上角带倒三角的轨道-导入字幕，并选择你的 ass 文件，勾选"Burn in"，甚至可以实现压制硬字幕这一功能，这个办法一般人我不告诉ta……也就是说，在不需要编辑的情况下，HandBrake 可能就是一站式的视频压制解决方案了！由于这个功能太过于简单便捷，笔者直到写到这里之前都忘记了还有这么简单的办法，感觉可能比 Arctime 还要简单啊。

   ::pic
   ---
   src: https://img.gnix807.cn/%E4%B8%8B%E8%BD%BD%20(6).png
   caption: 字幕页面 Burn in 硬字幕
   ---
   ::

B站站内亦有 HandBrake 的视频教程。或参阅软件[官方文档](https://handbrake.fr/docs)（仅有英语文档可用，德语文档许久未更新）。

## 三、小丸工具箱（已过时）

这个工具使用很便捷，在B站上有很多使用教程（它曾经也是B站半官方地推荐使用的压制软件），搜索即达。缺点是开发略微落后于当前时代，不过对于压制硬字幕这一用途仍然绰绰有余。

工具箱官网：[点击跳转](https://maruko.appinn.me)

使用教程我实在懒得写了，看看视频吧。

::video-embed
---
type: bilibili
id: BV1um4y127zm
---
::
