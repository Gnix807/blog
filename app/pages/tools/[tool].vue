<script setup lang="ts">
const route = useRoute()
const tool = route.params.tool as string

const toolsMap: Record<string, { title: string; description: string }> = {
	convert: {
		title: '图片格式转换',
		description: '纯浏览器端图片格式互转，支持 WebP / PNG / JPEG。数据不上传，离线可用。',
	},
	watermark: {
		title: '图片水印',
		description: '上传图片，添加文字水印。可调节位置、大小、透明度。',
	},
}

const meta = computed(() => toolsMap[tool])
if (meta.value) {
	useSeoMeta({
		title: `${meta.value.title} - 工具箱`,
		description: meta.value.description,
	})
}
else if (import.meta.server) {
	const event = useRequestEvent()
	event && setResponseStatus(event, 404)
}
</script>

<template>
<template v-if="tool === 'convert'" key="convert">
	<ToolsConvert />
</template>
<template v-else-if="tool === 'watermark'" key="watermark">
	<ToolsWatermark />
</template>
<div v-else class="tool-page">
	<div class="tool-topbar">
		<NuxtLink to="/tools" class="back-link">
			<Icon name="tabler:arrow-left" />
			<span>工具箱</span>
		</NuxtLink>
	</div>
	<h1>工具未找到</h1>
	<p class="subtitle">你找的工具不存在。</p>
</div>
</template>
