<script setup lang="ts">
import { Sandpack } from 'sandpack-vue3'

const props = defineProps<{
	dir: string
	template?: string
	title?: string
}>()

const { data: rawFiles, status } = useAsyncData(
	`sandpack:${props.dir}`,
	() => $fetch<Record<string, string>>('/api/sandpack-files', {
		query: { dir: props.dir },
	}),
)

const files = computed(() => {
	if (!rawFiles.value)
		return {}
	return Object.fromEntries(
		Object.entries(rawFiles.value).map(([name, code]) => [`/src${name}`, code]),
	)
})

const hasFiles = computed(() => Object.keys(files.value).length > 0)

const colorMode = useColorMode()

const customTheme = computed(() => colorMode.value === 'dark' ? {
	colors: {
		surface1: '#1a1a2e',
		surface2: '#16213e',
		surface3: '#0f3460',
		clickable: '#a0a0a0',
		base: '#e0e0e0',
		disabled: '#555',
		hover: '#e94560',
		accent: '#00dc82',
	},
	syntax: {
		keyword: '#c792ea',
		property: '#82aaff',
		definition: '#89ddff',
		static: '#f78c6c',
		string: '#c3e88d',
		plain: '#e0e0e0',
		comment: '#676e95',
		punctuation: '#89ddff',
	},
	font: {
		body: 'var(--font-monospace, "JetBrains Mono", monospace)',
		mono: 'var(--font-monospace, "JetBrains Mono", monospace)',
		size: '14px',
		lineHeight: '1.6',
	},
} : {
	colors: {
		surface1: '#fafafa',
		surface2: '#f0f0f0',
		surface3: '#e8e8e8',
		clickable: '#666',
		base: '#333',
		disabled: '#bbb',
		hover: '#00dc82',
		accent: '#00dc82',
	},
	syntax: {
		keyword: '#7c4dff',
		property: '#2979ff',
		definition: '#00b0ff',
		static: '#ff6e40',
		string: '#2e7d32',
		plain: '#333',
		comment: '#90a4ae',
		punctuation: '#546e7a',
	},
	font: {
		body: 'var(--font-monospace, "JetBrains Mono", monospace)',
		mono: 'var(--font-monospace, "JetBrains Mono", monospace)',
		size: '14px',
		lineHeight: '1.6',
	},
})
</script>

<template>
<ClientOnly>
	<div v-if="status === 'success' && hasFiles" class="sandpack-wrapper card">
		<div v-if="title" class="sandpack-header text-creative">
			<Icon name="tabler:code" />
			<span>{{ title }}</span>
		</div>
		<div class="sandpack-embed">
			<Sandpack
				:template="(template as any) ?? 'vue3'"
				:files="files"
				:theme="customTheme as any"
				:options="{
					showLineNumbers: true,
					editorWidthPercentage: 55,
					showNavigator: false,
					showTabs: true,
					showInlineErrors: true,
				}"
			/>
		</div>
	</div>
	<div v-else-if="status === 'success' && !hasFiles" class="sandpack-empty">
		<Icon name="tabler:file-off" /> 未在 <code>{{ dir }}</code> 找到演示文件
	</div>
	<template #fallback>
		<div class="sandpack-skeleton">
			<Icon name="tabler:loader-2" class="spinner" /> 加载演示中…
		</div>
	</template>
</ClientOnly>
</template>

<style lang="scss" scoped>
.sandpack-wrapper {
	overflow: hidden;
	margin: 1.5em 0;

	article & {
		max-width: 100%;
	}
}

.sandpack-header {
	display: flex;
	align-items: center;
	gap: 0.4em;
	padding: 0.6em 1em;
	font-size: 0.9em;
	color: var(--c-text-2);
	border-bottom: 1px solid var(--c-border);
}

.sandpack-embed {
	:deep(.sp-wrapper) {
		border-radius: 0;
	}

	:deep(.sp-layout) {
		border: none;
		border-radius: 0;
	}

	:deep(.sp-tab-button) {
		font-size: 0.85em;
	}
}

.sandpack-skeleton {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5em;
	height: 260px;
	border-radius: 0.5rem;
	background: var(--c-bg-2);
	color: var(--c-text-3);
	font-size: 0.95em;

	.spinner {
		animation: spin 1s linear infinite;
	}
}

.sandpack-empty {
	display: flex;
	align-items: center;
	gap: 0.5em;
	padding: 1.2em 1em;
	border-radius: 0.5rem;
	background: var(--c-bg-2);
	font-size: 0.9em;
	color: var(--c-text-3);
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
</style>
