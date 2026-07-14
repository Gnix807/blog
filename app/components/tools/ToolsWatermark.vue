<script setup lang="ts">
const inputEl = ref<HTMLInputElement>()
const canvasEl = ref<HTMLCanvasElement>()
const previewUrl = ref('')
const downloading = ref(false)
const watermarkText = ref('')
const fontSize = ref(48)
const opacity = ref(0.3)
const position = ref<'tl' | 'tr' | 'bl' | 'br' | 'center'>('br')
const color = ref('#ffffff')

const positionOptions = [
	{ value: 'tl' as const, label: '左上' },
	{ value: 'tr' as const, label: '右上' },
	{ value: 'bl' as const, label: '左下' },
	{ value: 'br' as const, label: '右下' },
	{ value: 'center' as const, label: '居中' },
]

function handleFile(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = (ev) => {
		const src = ev.target?.result as string
		const img = new Image()
		img.onload = () => {
			previewUrl.value = src
			if (watermarkText.value) drawWatermark(img)
		}
		img.src = src
	}
	reader.readAsDataURL(file)
}

function drawWatermark(img?: HTMLImageElement) {
	if (!previewUrl.value) return
	const canvas = canvasEl.value!
	const ctx = canvas.getContext('2d')!
	if (img) {
		canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
		ctx.drawImage(img, 0, 0)
	} else {
		const existingImg = new Image()
		existingImg.onload = () => {
			canvas.width = existingImg.naturalWidth; canvas.height = existingImg.naturalHeight
			ctx.drawImage(existingImg, 0, 0); drawText(ctx)
		}
		existingImg.src = previewUrl.value; return
	}
	drawText(ctx)
}

function drawText(ctx: CanvasRenderingContext2D) {
	ctx.font = `${fontSize.value}px sans-serif`
	ctx.fillStyle = `${color.value}${Math.round(opacity.value * 255).toString(16).padStart(2, '0')}`
	ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
	const pad = Math.max(fontSize.value * 1.5, 40)
	let x: number, y: number
	switch (position.value) {
		case 'tl': x = pad; y = pad + fontSize.value / 2; break
		case 'tr': x = canvasEl.value!.width - pad; y = pad + fontSize.value / 2; break
		case 'bl': x = pad; y = canvasEl.value!.height - pad - fontSize.value / 2; break
		case 'br': x = canvasEl.value!.width - pad; y = canvasEl.value!.height - pad - fontSize.value / 2; break
		case 'center': x = canvasEl.value!.width / 2; y = canvasEl.value!.height / 2; break
	}
	ctx.fillText(watermarkText.value, x, y)
}

function download() {
	if (!canvasEl.value) return
	downloading.value = true
	canvasEl.value.toBlob((blob) => {
		if (!blob) return
		const a = document.createElement('a')
		a.href = URL.createObjectURL(blob); a.download = `watermarked.png`; a.click()
		downloading.value = false
	}, 'image/png')
}

watch([watermarkText, fontSize, opacity, position, color], () => {
	if (previewUrl.value) drawWatermark()
})
</script>

<template>
<div class="tool-page">
	<div class="tool-topbar">
		<NuxtLink to="/tools" class="back-link">
			<Icon name="tabler:arrow-left" />
			<span>工具箱</span>
		</NuxtLink>
	</div>
	<h1>图片水印</h1>
	<p class="subtitle">添加文字水印，纯浏览器端处理，图片不会上传。</p>
	<div class="watermark-tool">
		<div class="upload-zone" @click="inputEl?.click()">
			<canvas ref="canvasEl" v-if="previewUrl" class="preview-canvas" />
			<template v-else>
				<Icon name="tabler:cloud-upload" class="upload-icon" />
				<p class="upload-hint">点击上传图片</p>
			</template>
		</div>
		<input ref="inputEl" type="file" accept="image/*" hidden @change="handleFile">
		<div class="controls" v-if="previewUrl">
			<div class="control-row">
				<label>水印文字</label>
				<input v-model="watermarkText" type="text" placeholder="输入水印文字" class="text-input">
			</div>
			<div class="control-row">
				<label>字号：{{ fontSize }}px</label>
				<input type="range" min="12" max="200" v-model.number="fontSize" class="slider">
			</div>
			<div class="control-row">
				<label>透明度：{{ Math.round(opacity * 100) }}%</label>
				<input type="range" min="0.05" max="1" step="0.05" v-model.number="opacity" class="slider">
			</div>
			<div class="control-row">
				<label>位置</label>
				<div class="position-btns">
					<button v-for="opt in positionOptions" :key="opt.value" :class="{ active: position === opt.value }" @click="position = opt.value">
						{{ opt.label }}
					</button>
				</div>
			</div>
			<div class="control-row">
				<label>颜色</label>
				<div class="color-row">
					<input type="color" v-model="color" class="color-picker">
					<button class="color-preset" :class="{ active: color === '#ffffff' }" @click="color = '#ffffff'" style="background: #fff" />
					<button class="color-preset" :class="{ active: color === '#000000' }" @click="color = '#000000'" style="background: #000" />
					<button class="color-preset" :class="{ active: color === '#ef4444' }" @click="color = '#ef4444'" style="background: #ef4444" />
				</div>
			</div>
			<button class="download-btn" :disabled="!watermarkText || downloading" @click="download">
				<Icon name="tabler:download" />
				<span>{{ downloading ? '下载中...' : '下载 PNG' }}</span>
			</button>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.tool-page { padding: 1rem; max-width: 720px; }

.tool-topbar {
	margin-bottom: 0.8rem;
	.back-link {
		display: inline-flex; align-items: center; gap: 0.3em;
		font-size: 0.85em; color: var(--c-text-2); text-decoration: none; transition: color 0.2s;
		&:hover { color: var(--c-primary); }
	}
}

h1 { margin: 0; font-size: 1.6em; }

.subtitle { margin: 0.3em 0 1.2rem; font-size: 0.9em; color: var(--c-text-2); }

.upload-zone {
	display: flex; flex-direction: column; align-items: center; justify-content: center;
	min-height: 200px; border: 2px dashed var(--c-border); border-radius: 0.8em;
	cursor: pointer; transition: border-color 0.2s, background-color 0.2s; overflow: hidden;
	&:hover { border-color: var(--c-primary); background-color: var(--c-bg-soft); }
	.upload-icon { font-size: 2.5em; color: var(--c-text-3); }
	.upload-hint { margin-top: 0.5em; font-size: 0.9em; color: var(--c-text-3); }
	.preview-canvas { max-width: 100%; max-height: 400px; object-fit: contain; }
}

.controls {
	display: flex; flex-direction: column; gap: 1rem; margin-top: 1.2rem;
	.control-row { display: flex; flex-direction: column; gap: 0.4em; label { font-size: 0.85em; color: var(--c-text-2); } }
	.text-input { padding: 0.5em 0.7em; border: 1px solid var(--c-border); border-radius: 0.4em; background-color: var(--c-bg); color: var(--c-text); font-size: 0.95em; outline: none; transition: border-color 0.2s; &:focus { border-color: var(--c-primary); } }
	.slider { width: 100%; accent-color: var(--c-primary); }
	.position-btns {
		display: flex; gap: 0.3em;
		button {
			padding: 0.4em 1em; border: 1px solid var(--c-border); border-radius: 0.4em;
			font-size: 0.9em; color: var(--c-text-2); transition: all 0.2s;
			&:hover { border-color: var(--c-primary); }
			&.active { background-color: var(--c-primary-soft); border-color: var(--c-primary); color: var(--c-primary); }
		}
	}
	.color-row {
		display: flex; align-items: center; gap: 0.4em;
		.color-picker { width: 36px; height: 36px; border: none; border-radius: 0.4em; cursor: pointer; padding: 2px; }
		.color-preset { width: 28px; height: 28px; border: 2px solid var(--c-border); border-radius: 50%; cursor: pointer; transition: border-color 0.2s; &.active { border-color: var(--c-primary); } }
	}
	.download-btn {
		display: inline-flex; align-items: center; justify-content: center; gap: 0.4em;
		padding: 0.6em 1.5em; border-radius: 0.5em; background-color: var(--c-primary);
		color: #fff; font-size: 0.95em; transition: opacity 0.2s;
		&:hover { opacity: 0.9; } &:disabled { opacity: 0.5; cursor: not-allowed; }
	}
}
</style>
