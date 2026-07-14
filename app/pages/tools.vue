<script setup lang="ts">
import { tools, categoryLabels, type ToolItem } from '~/tools'

const appConfig = useAppConfig()
useSeoMeta({
	title: '工具箱',
	description: '一些实用的小工具，纯前端运行，数据不离开你的浏览器。',
})

const activeTool = ref<string | null>(null)
const category = ref<ToolItem['category'] | 'all'>('all')

const tabs = computed(() => [
	{ key: 'all' as const, label: '全部' },
	...(Object.keys(categoryLabels) as ToolItem['category'][])
		.filter(k => tools.some(t => t.category === k))
		.map(k => ({ key: k, label: categoryLabels[k] })),
])

const filtered = computed(() =>
	category.value === 'all'
		? tools
		: tools.filter(t => t.category === category.value),
)

function openTool(name: string) { activeTool.value = name }
function back() { activeTool.value = null }
</script>

<template>
<template #aside>
	<WidgetGithubCard />
	<WidgetBlogStats />
</template>

<div v-if="!activeTool" class="tools-page">
	<header class="tools-header">
		<h1>工具箱</h1>
		<p>一些实用的小工具，纯前端运行，数据不离开你的浏览器。</p>
	</header>
	<div class="tools-tabs">
		<button v-for="tab in tabs" :key="tab.key" class="tool-tab" :class="{ active: category === tab.key }" @click="category = tab.key">
			{{ tab.label }}
		</button>
	</div>
	<TransitionGroup tag="div" class="tools-grid" name="float-in">
		<button v-for="item in filtered" :key="item.name" class="tool-card card" @click="openTool(item.name)">
			<div class="tool-head">
				<Icon class="tool-icon" :name="item.icon" />
				<h3 class="tool-name">{{ item.name }}</h3>
			</div>
			<p class="tool-desc">{{ item.description }}</p>
			<span class="tool-category">{{ categoryLabels[item.category] }}</span>
		</button>
	</TransitionGroup>
</div>

<ToolsConvert v-else-if="activeTool === '图片格式转换'" @back="back" />
<ToolsWatermark v-else-if="activeTool === '图片水印'" @back="back" />
<ToolsBase64 v-else-if="activeTool === 'Base64 编解码'" @back="back" />
<ToolsUrlEncoder v-else-if="activeTool === 'URL 编解码'" @back="back" />
<ToolsJsonFormatter v-else-if="activeTool === 'JSON 格式化'" @back="back" />
<ToolsUuidGenerator v-else-if="activeTool === 'UUID 生成器'" @back="back" />
<ToolsTimestampConverter v-else-if="activeTool === '时间戳转换'" @back="back" />
</template>

<style lang="scss" scoped>
.tools-page { padding: 1rem; }
.tools-header { margin-bottom: 1rem; h1 { margin: 0; font-size: 1.8em; } p { margin: 0.3em 0 0; color: var(--c-text-2); font-size: 0.9em; } }
.tools-tabs { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 1.2rem; .tool-tab { padding: 0.3em 0.8em; border-radius: 1em; font-size: 0.85em; color: var(--c-text-2); transition: all 0.2s; &:hover { background-color: var(--c-bg-soft); color: var(--c-text); } &.active { background-color: var(--c-primary-soft); color: var(--c-primary); } } }
.tools-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.tool-card { position: relative; display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; text-align: start; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; &:hover { transform: translateY(-3px); box-shadow: var(--box-shadow-3); } .tool-head { display: flex; align-items: center; gap: 0.5rem; .tool-icon { font-size: 1.5em; color: var(--c-primary); flex-shrink: 0; } .tool-name { margin: 0; font-size: 1.05em; color: var(--c-text); } } .tool-desc { margin: 0; font-size: 0.85em; line-height: 1.5; color: var(--c-text-2); flex-grow: 1; } .tool-category { align-self: flex-start; padding: 0.1em 0.5em; border-radius: 0.4em; background-color: var(--c-primary-soft); color: var(--c-primary); font-size: 0.72em; } }
</style>
