---
title: Tab 组件变体示例
description: pill / underline / segment 三种 Tab 变体的效果预览。
date: 2026-07-14 00:00:00
---

# Tab 组件变体

## pill（默认）

按钮式标签，带阴影和底部指示条。

::tab{:tabs='["介绍","用法","注意"]'}

#tab1
`pill` 是默认样式，不传 `variant` 或传 `variant="pill"` 效果相同。

#tab2
```md
::tab{:tabs='["介绍","用法","注意"]'}

#tab1
内容

::
```
不传 variant 默认就是 pill。

#tab3
适合短标签（2-4 个），再多会换行。

::

## underline

下划线指示条，适合做章节导航。

::tab{variant="underline" :tabs='["第一章","第二章","第三章"]'}

#tab1
underline 样式简洁，适合长内容。

#tab2
下划线跟随激活标签滑动切换。

#tab3
```md
::tab{variant="underline" :tabs='["第一章","第二章","第三章"]'}

#tab1
内容

::
```

::

## segment

iOS 风格分段控件，紧凑省空间。

::tab{variant="segment" :tabs='["日","周","月","年"]'}

#tab1
segment 适合做时间范围或分类筛选。

#tab2
视觉上最紧凑，节省垂直空间。

#tab3
```md
::tab{variant="segment" :tabs='["日","周","月","年"]'}

#tab1
内容

::
```

#tab4
第四个标签。

::
