<script setup lang="ts">
defineEmits<{ back: [] }>()

const canvasEl = ref<HTMLCanvasElement>()
const originalUrl = ref('')
const resultUrl = ref('')
const watermarkText = ref('')
const fontSize = ref(48)
const opacity = ref(0.3)
const position = ref<'tl' | 'tr' | 'bl' | 'br' | 'center' | 'tile'>('br')
const color = ref('#ffffff')
const rotation = ref(-30)
const bold = ref(false)
const tileSpacing = ref(200)

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
	img.onload = () => { _img = img; applyWatermark() }
	img.src = originalUrl.value
}

function applyWatermark() {
	if (!_img || !canvasEl.value) return
	const canvas = canvasEl.value
	canvas.width = _img.naturalWidth; canvas.height = _img.naturalHeight
	const ctx = canvas.getContext('2d')!
	ctx.drawImage(_img, 0, 0)
	if (!watermarkText.value) { resultUrl.value = originalUrl.value; return }

	const w = canvas.width; const h = canvas.height
	ctx.font = `${bold.value ? 'bold ' : ''}${fontSize.value}px sans-serif`
	ctx.fillStyle = color.value + Math.round(opacity.value * 255).toString(16).padStart(2, '0')
	ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save()

	if (position.value === 'tile') {
		const rad = (rotation.value * Math.PI) / 180
		const sp = Math.max(tileSpacing.value, fontSize.value * 2)
		for (let r = -1; r < Math.ceil(h / sp) + 2; r++) for (let c = -1; c < Math.ceil(w / sp) + 2; c++) {
			ctx.save(); ctx.translate(c * sp + sp / 2, r * sp + sp / 2); ctx.rotate(rad)
			ctx.fillText(watermarkText.value, 0, 0); ctx.restore()
		}
	} else {
		const rad = (rotation.value * Math.PI) / 180; const pad = Math.max(fontSize.value * 1.5, 40)
		let x: number, y: number
		switch (position.value) {
			case 'tl': x = pad; y = pad + fontSize.value / 2; break
			case 'tr': x = w - pad; y = pad + fontSize.value / 2; break
			case 'bl': x = pad; y = h - pad - fontSize.value / 2; break
			case 'br': x = w - pad; y = h - pad - fontSize.value / 2; break
			default: x = w / 2; y = h / 2
		}
		ctx.translate(x, y); ctx.rotate(rad); ctx.fillText(watermarkText.value, 0, 0)
	}
	ctx.restore()
	resultUrl.value = canvas.toDataURL()
}

watch([watermarkText, fontSize, opacity, position, color, rotation, bold, tileSpacing], () => { if (originalUrl.value) applyWatermark() })
</script>

<template>
<div class="tool-page">
	<button class="back-link" @click="$emit('back')"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1>图片水印</h1>
	<p class="subtitle">添加文字水印，支持平铺模式。纯浏览器端处理。</p>

	<label class="upload-zone" for="wm-input">
		<img v-if="resultUrl" :src="resultUrl" class="preview-img" alt="">
		<template v-else>
			<Icon name="tabler:cloud-upload" class="upload-icon" />
			<p class="upload-hint">点击上传图片</p>
		</template>
	</label>
	<input id="wm-input" type="file" accept="image/*" hidden @change="handleFile">
	<canvas ref="canvasEl" style="display:none" />

	<div class="controls" v-if="originalUrl">
		<div class="row"><label>水印文字</label><input v-model="watermarkText" type="text" placeholder="输入水印文字" class="text-input"></div>
		<div class="row"><label>字号：{{ fontSize }}px</label><input type="range" min="12" max="200" v-model.number="fontSize" class="slider"></div>
		<div class="row"><label>旋转：{{ rotation }}°</label><input type="range" min="-90" max="90" v-model.number="rotation" class="slider"></div>
		<div class="row"><label>透明度：{{ Math.round(opacity * 100) }}%</label><input type="range" min="0.05" max="1" step="0.05" v-model.number="opacity" class="slider"></div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.tool-page { padding: 1rem; max-width: 720px; }
.back-link { display: inline-flex; align-items: center; gap: 0.3em; font-size: 0.85em; color: var(--c-text-2); cursor: pointer; margin-bottom: 0.8rem; }
h1 { margin: 0; font-size: 1.6em; }
.subtitle { margin: 0.3em 0 1rem; font-size: 0.9em; color: var(--c-text-2); }
.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; border: 2px dashed var(--c-border); border-radius: 0.8em; cursor: pointer; margin-bottom: 1rem; .upload-icon { font-size: 2.5em; color: var(--c-text-3); } .upload-hint { margin-top: 0.5em; font-size: 0.9em; color: var(--c-text-3); } .preview-img { max-width: 100%; max-height: 400px; object-fit: contain; } }
.controls { display: flex; flex-direction: column; gap: 1rem; .row { display: flex; flex-direction: column; gap: 0.3em; label { font-size: 0.85em; color: var(--c-text-2); } } }
.text-input { padding: 0.5em 0.7em; border: 1px solid var(--c-border); border-radius: 0.4em; background: var(--c-bg); color: var(--c-text); font-size: 0.95em; outline: none; &:focus { border-color: var(--c-primary); } }
.slider { width: 100%; accent-color: var(--c-primary); }
</style>
