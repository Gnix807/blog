<script setup lang="ts">
useSeoMeta({
	title: '图片格式转换 - 工具箱',
	description: '纯浏览器端图片格式互转，支持 WebP / PNG / JPEG。数据不上传，离线可用。',
})

const inputEl = ref<HTMLInputElement>()
const canvasEl = ref<HTMLCanvasElement>()
const format = ref<'image/webp' | 'image/png' | 'image/jpeg'>('image/webp')
const quality = ref(0.85)
const downloading = ref(false)
const fileName = ref('')
const originalSize = ref('')
const convertedSize = ref('')
const previewUrl = ref('')
const convertedUrl = ref('')

const formatOptions = [
	{ value: 'image/webp' as const, label: 'WebP', ext: '.webp' },
	{ value: 'image/png' as const, label: 'PNG', ext: '.png' },
	{ value: 'image/jpeg' as const, label: 'JPEG', ext: '.jpg' },
]

const currentExt = computed(() => formatOptions.find(f => f.value === format.value)!.ext)

function handleFile(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0]
	if (!file) return

	originalSize.value = formatBytes(file.size)
	fileName.value = file.name.replace(/\.[^.]+$/, '')

	const reader = new FileReader()
	reader.onload = (ev) => {
		previewUrl.value = ev.target?.result as string
		convertImage(ev.target?.result as string)
	}
	reader.readAsDataURL(file)
}

function convertImage(src: string) {
	const img = new Image()
	img.onload = () => {
		const canvas = canvasEl.value!
		canvas.width = img.naturalWidth
		canvas.height = img.naturalHeight
		const ctx = canvas.getContext('2d')!
		ctx.drawImage(img, 0, 0)
		canvas.toBlob((blob) => {
			if (!blob) return
			convertedSize.value = formatBytes(blob.size)
			convertedUrl.value = URL.createObjectURL(blob)
		}, format.value, quality.value)
	}
	img.src = src
}

function download() {
	if (!convertedUrl.value) return
	downloading.value = true
	const a = document.createElement('a')
	a.href = convertedUrl.value
	a.download = `${fileName.value || 'converted'}${currentExt.value}`
	a.click()
	setTimeout(() => { downloading.value = false }, 1000)
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / 1048576).toFixed(2)} MB`
}
</script>

<template>
<div class="tool-page">
	<div class="tool-topbar">
		<NuxtLink to="/tools" class="back-link">
			<Icon name="tabler:arrow-left" />
			<span>工具箱</span>
		</NuxtLink>
	</div>

	<h1>图片格式转换</h1>
	<p class="subtitle">纯浏览器端运行，图片不会上传。支持 WebP / PNG / JPEG 互转。</p>

	<div class="converter">
		<div class="upload-zone" @click="inputEl?.click()" @dragover.prevent @drop.prevent="(e) => { if (e.dataTransfer?.files[0]) { const dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]); if (inputEl) { inputEl.files = dt.files; handleFile({ target: inputEl } as any) } } }">
			<Icon v-if="!previewUrl" name="tabler:cloud-upload" class="upload-icon" />
			<template v-else>
				<img :src="previewUrl" class="preview-img" alt="preview" />
			</template>
			<input ref="inputEl" type="file" accept="image/*" hidden @change="handleFile">
			<p v-if="!previewUrl" class="upload-hint">点击或拖拽图片到这里</p>
		</div>

		<div class="controls" v-if="previewUrl">
			<div class="control-row">
				<label>目标格式</label>
				<div class="format-btns">
					<button
						v-for="opt in formatOptions"
						:key="opt.value"
						:class="{ active: format === opt.value }"
						@click="format = opt.value; convertImage(previewUrl)"
					>
						{{ opt.label }}
					</button>
				</div>
			</div>

			<div class="control-row" v-if="format !== 'image/png'">
				<label>质量：{{ Math.round(quality * 100) }}%</label>
				<input
					type="range"
					min="0.1"
					max="1"
					step="0.05"
					v-model.number="quality"
					class="slider"
					@change="convertImage(previewUrl)"
				>
			</div>

			<div class="result-info" v-if="originalSize && convertedSize">
				<div class="size-item">
					<span class="size-label">原始</span>
					<span class="size-value">{{ originalSize }}</span>
				</div>
				<Icon name="tabler:arrow-right" class="arrow" />
				<div class="size-item">
					<span class="size-label">{{ formatOptions.find(f => f.value === format)!.label }}</span>
					<span class="size-value converted">{{ convertedSize }}</span>
				</div>
			</div>

			<button class="download-btn" :disabled="!convertedUrl || downloading" @click="download">
				<Icon name="tabler:download" />
				<span>{{ downloading ? '下载中...' : '下载' }}</span>
			</button>
		</div>

		<canvas ref="canvasEl" hidden />
	</div>
</div>
</template>

<style lang="scss" scoped>
.tool-page {
	padding: 1rem;
	max-width: 720px;
}

.tool-topbar {
	margin-bottom: 0.8rem;

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		font-size: 0.85em;
		color: var(--c-text-2);
		text-decoration: none;
		transition: color 0.2s;

		&:hover {
			color: var(--c-primary);
		}
	}
}

h1 {
	margin: 0;
	font-size: 1.6em;
}

.subtitle {
	margin: 0.3em 0 1.2rem;
	font-size: 0.9em;
	color: var(--c-text-2);
}

.upload-zone {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 200px;
	border: 2px dashed var(--c-border);
	border-radius: 0.8em;
	cursor: pointer;
	transition: border-color 0.2s, background-color 0.2s;
	overflow: hidden;

	&:hover {
		border-color: var(--c-primary);
		background-color: var(--c-bg-soft);
	}

	.upload-icon {
		font-size: 2.5em;
		color: var(--c-text-3);
	}

	.upload-hint {
		margin-top: 0.5em;
		font-size: 0.9em;
		color: var(--c-text-3);
	}

	.preview-img {
		max-width: 100%;
		max-height: 300px;
		object-fit: contain;
	}
}

.controls {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin-top: 1.2rem;

	.control-row {
		display: flex;
		flex-direction: column;
		gap: 0.4em;

		label {
			font-size: 0.85em;
			color: var(--c-text-2);
		}
	}

	.format-btns {
		display: flex;
		gap: 0.3em;

		button {
			padding: 0.4em 1em;
			border: 1px solid var(--c-border);
			border-radius: 0.4em;
			font-size: 0.9em;
			color: var(--c-text-2);
			transition: all 0.2s;

			&:hover {
				border-color: var(--c-primary);
			}

			&.active {
				background-color: var(--c-primary-soft);
				border-color: var(--c-primary);
				color: var(--c-primary);
			}
		}
	}

	.slider {
		width: 100%;
		accent-color: var(--c-primary);
	}

	.result-info {
		display: flex;
		align-items: center;
		gap: 0.8em;
		padding: 0.8em;
		border-radius: 0.5em;
		background-color: var(--c-bg-soft);

		.size-item {
			text-align: center;

			.size-label {
				display: block;
				font-size: 0.75em;
				color: var(--c-text-3);
			}

			.size-value {
				font-weight: 600;
				font-size: 0.95em;
				color: var(--c-text);

				&.converted {
					color: var(--c-primary);
				}
			}
		}

		.arrow {
			color: var(--c-text-3);
		}
	}

	.download-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		padding: 0.6em 1.5em;
		border-radius: 0.5em;
		background-color: var(--c-primary);
		color: #fff;
		font-size: 0.95em;
		transition: opacity 0.2s;

		&:hover {
			opacity: 0.9;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}
</style>
