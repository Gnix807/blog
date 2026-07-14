<script setup lang="ts">
defineEmits<{ back: [] }>()

const inputEl = ref<HTMLInputElement>()
const canvasEl = ref<HTMLCanvasElement>()
const originalUrl = ref('')
const resultUrl = ref('')
const downloading = ref(false)
const watermarkText = ref('')
const fontSize = ref(48)
const opacity = ref(0.3)
const position = ref<'tl' | 'tr' | 'bl' | 'br' | 'center' | 'tile'>('br')
const color = ref('#ffffff')
const rotation = ref(-30)
const bold = ref(false)
const exportFormat = ref<'image/png' | 'image/jpeg' | 'image/webp'>('image/png')
const tileSpacing = ref(200)

const exportExt = computed(() => ({ 'image/jpeg': '.jpg', 'image/webp': '.webp' }[exportFormat.value] || '.png'))
const exportMime = computed(() => exportFormat.value === 'image/png' ? 'image/png' : exportFormat.value)

const positionOptions = [
	{ value: 'tile' as const, label: '平铺' },
	{ value: 'tl' as const, label: '左上' },
	{ value: 'tr' as const, label: '右上' },
	{ value: 'bl' as const, label: '左下' },
	{ value: 'br' as const, label: '右下' },
	{ value: 'center' as const, label: '居中' },
]

let _img: HTMLImageElement | null = null

function handleFile(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = (ev) => {
		originalUrl.value = ev.target?.result as string
		nextTick(redraw)
	}
	reader.readAsDataURL(file)
}

function redraw() {
	if (!originalUrl.value) return
	const img = new Image()
	img.onload = () => {
		_img = img
		applyWatermark()
	}
	img.src = originalUrl.value
}

function applyWatermark() {
	if (!_img || !canvasEl.value) return
	const canvas = canvasEl.value
	canvas.width = _img.naturalWidth
	canvas.height = _img.naturalHeight
	const ctx = canvas.getContext('2d')!
	ctx.drawImage(_img, 0, 0)

	if (!watermarkText.value) {
		resultUrl.value = originalUrl.value
		return
	}

	const w = canvas.width
	const h = canvas.height
	const weight = bold.value ? 'bold ' : ''
	ctx.font = `${weight}${fontSize.value}px sans-serif`
	ctx.fillStyle = color.value + Math.round(opacity.value * 255).toString(16).padStart(2, '0')
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.save()

	if (position.value === 'tile') {
		const rad = (rotation.value * Math.PI) / 180
		const spacing = Math.max(tileSpacing.value, fontSize.value * 2)
		const cols = Math.ceil(w / spacing) + 2
		const rows = Math.ceil(h / spacing) + 2
		for (let row = -1; row < rows; row++) {
			for (let col = -1; col < cols; col++) {
				ctx.save()
				ctx.translate(col * spacing + spacing / 2, row * spacing + spacing / 2)
				ctx.rotate(rad)
				ctx.fillText(watermarkText.value, 0, 0)
				ctx.restore()
			}
		}
	} else {
		const rad = (rotation.value * Math.PI) / 180
		const pad = Math.max(fontSize.value * 1.5, 40)
		let x: number, y: number
		switch (position.value) {
			case 'tl': x = pad; y = pad + fontSize.value / 2; break
			case 'tr': x = w - pad; y = pad + fontSize.value / 2; break
			case 'bl': x = pad; y = h - pad - fontSize.value / 2; break
			case 'br': x = w - pad; y = h - pad - fontSize.value / 2; break
			default: x = w / 2; y = h / 2
		}
		ctx.translate(x, y)
		ctx.rotate(rad)
		ctx.fillText(watermarkText.value, 0, 0)
	}
	ctx.restore()
	resultUrl.value = canvas.toDataURL()
}

function download() {
	if (!canvasEl.value) return
	downloading.value = true
	const mime = exportMime.value
	const quality = mime === 'image/png' ? undefined : 0.9
	canvasEl.value.toBlob((blob) => {
		if (!blob) return
		const a = document.createElement('a')
		a.href = URL.createObjectURL(blob)
		a.download = `watermarked${exportExt.value}`
		a.click()
		downloading.value = false
	}, mime, quality)
}

watch([watermarkText, fontSize, opacity, position, color, rotation, bold, tileSpacing], () => {
	if (originalUrl.value) applyWatermark()
})
</script>

<template>
<div class="tool-page">
	<div class="tool-topbar">
		<button class="back-link" @click="$emit('back')">
			<Icon name="tabler:arrow-left" /><span>工具箱</span>
		</button>
	</div>
	<h1>图片水印</h1>
	<p class="subtitle">添加文字水印，支持平铺模式。纯浏览器端处理，图片不会上传。</p>

	<div class="upload-zone" @click="inputEl?.click()">
		<img v-if="resultUrl" :src="resultUrl" class="preview-img" alt="">
		<template v-else>
			<Icon name="tabler:cloud-upload" class="upload-icon" />
			<p class="upload-hint">点击上传图片</p>
		</template>
	</div>
	<input ref="inputEl" type="file" accept="image/*" hidden @change="handleFile">
	<canvas ref="canvasEl" style="display:none" />

	<div class="controls" v-if="originalUrl">
		<div class="control-row">
			<label>水印文字</label>
			<input v-model="watermarkText" type="text" placeholder="输入水印文字" class="text-input">
		</div>
		<div class="control-row">
			<label>水印模式</label>
			<div class="chips">
				<button v-for="opt in positionOptions" :key="opt.value" :class="{ active: position === opt.value }" @click="position = opt.value">{{ opt.label }}</button>
			</div>
		</div>
		<div class="control-row">
			<label>字号：{{ fontSize }}px</label>
			<input type="range" min="12" max="200" v-model.number="fontSize" class="slider">
		</div>
		<div class="control-row">
			<label>旋转：{{ rotation }}°</label>
			<input type="range" min="-90" max="90" v-model.number="rotation" class="slider">
		</div>
		<div class="control-row">
			<label>透明度：{{ Math.round(opacity * 100) }}%</label>
			<input type="range" min="0.05" max="1" step="0.05" v-model.number="opacity" class="slider">
		</div>
		<div class="control-row" v-if="position === 'tile'">
			<label>平铺间距：{{ tileSpacing }}px</label>
			<input type="range" min="80" max="500" step="10" v-model.number="tileSpacing" class="slider">
		</div>
		<div class="control-row">
			<label>字体加粗</label>
			<label class="switch-label">
				<input type="checkbox" v-model="bold" hidden>
				<span class="switch-track"><span class="switch-thumb" /></span>
				<span>{{ bold ? '开' : '关' }}</span>
			</label>
		</div>
		<div class="control-row">
			<label>颜色</label>
			<div class="color-row">
				<input type="color" v-model="color" class="color-picker">
				<button v-for="c in ['#ffffff','#000000','#ef4444']" :key="c" class="color-preset" :class="{ active: color === c }" :style="{ background: c }" @click="color = c" />
			</div>
		</div>
		<div class="control-row">
			<label>导出格式</label>
			<div class="chips">
				<button v-for="f in [{ v: 'image/png' as const, l: 'PNG' }, { v: 'image/jpeg' as const, l: 'JPEG' }, { v: 'image/webp' as const, l: 'WebP' }]" :key="f.v" :class="{ active: exportFormat === f.v }" @click="exportFormat = f.v">{{ f.l }}</button>
			</div>
		</div>
		<button class="download-btn" :disabled="!resultUrl || downloading" @click="download">
			<Icon name="tabler:download" />
			<span>{{ downloading ? '下载中...' : `下载 ${exportExt.value.replace('.','').toUpperCase()}` }}</span>
		</button>
	</div>
</div>
</template>

<style lang="scss" scoped>
.tool-page { padding: 1rem; max-width: 720px; }
.tool-topbar { margin-bottom: 0.8rem; .back-link { display: inline-flex; align-items: center; gap: 0.3em; font-size: 0.85em; color: var(--c-text-2); cursor: pointer; transition: color 0.2s; &:hover { color: var(--c-primary); } } }
h1 { margin: 0; font-size: 1.6em; }
.subtitle { margin: 0.3em 0 1.2rem; font-size: 0.9em; color: var(--c-text-2); }

.upload-zone {
	display: flex; flex-direction: column; align-items: center; justify-content: center;
	min-height: 200px; border: 2px dashed var(--c-border); border-radius: 0.8em;
	cursor: pointer; transition: border-color 0.2s, background-color 0.2s; overflow: hidden;
	&:hover { border-color: var(--c-primary); background-color: var(--c-bg-soft); }
	.upload-icon { font-size: 2.5em; color: var(--c-text-3); }
	.upload-hint { margin-top: 0.5em; font-size: 0.9em; color: var(--c-text-3); }
	.preview-img { max-width: 100%; max-height: 400px; object-fit: contain; }
}

.controls {
	display: flex; flex-direction: column; gap: 1rem; margin-top: 1.2rem;
	.control-row { display: flex; flex-direction: column; gap: 0.4em; & > label:first-child { font-size: 0.85em; color: var(--c-text-2); } }
	.text-input { padding: 0.5em 0.7em; border: 1px solid var(--c-border); border-radius: 0.4em; background: var(--c-bg); color: var(--c-text); font-size: 0.95em; outline: none; &:focus { border-color: var(--c-primary); } }
	.slider { width: 100%; accent-color: var(--c-primary); }
	.chips { display: flex; flex-wrap: wrap; gap: 0.3em; button { padding: 0.4em 1em; border: 1px solid var(--c-border); border-radius: 0.4em; font-size: 0.9em; color: var(--c-text-2); transition: all 0.2s; &:hover { border-color: var(--c-primary); } &.active { background: var(--c-primary-soft); border-color: var(--c-primary); color: var(--c-primary); } } }
	.color-row { display: flex; align-items: center; gap: 0.4em; .color-picker { width: 36px; height: 36px; border: none; border-radius: 0.4em; cursor: pointer; padding: 2px; } .color-preset { width: 28px; height: 28px; border: 2px solid var(--c-border); border-radius: 50%; cursor: pointer; &.active { border-color: var(--c-primary); } } }
	.switch-label { display: inline-flex; align-items: center; gap: 0.5em; cursor: pointer; font-size: 0.85em; color: var(--c-text-2); .switch-track { position: relative; width: 40px; height: 22px; border-radius: 11px; background: var(--c-border); .switch-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; } } input:checked + .switch-track { background: var(--c-primary); .switch-thumb { transform: translateX(18px); } } }
	.download-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.4em; padding: 0.6em 1.5em; border-radius: 0.5em; background: var(--c-primary); color: #fff; font-size: 0.95em; &:hover { opacity: 0.9; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
}
</style>
