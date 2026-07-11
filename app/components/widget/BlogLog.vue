<script setup lang="ts">
const { timeEstablished } = useAppConfig()

const blogLog = [
	{ label: '2026-07-10', value: '基于 Nuxt 4 + Nuxt Content v3 搭建「倪哥买提大巴扎」，启用 blog.gnix807.top 域名' },
	{ label: timeEstablished, value: '发布第一篇文章' },
]
</script>

<template>
<BlogWidget card title="更新日志">
	<ZDlGroup size="large" :items="blogLog" />
</BlogWidget>
</template>
