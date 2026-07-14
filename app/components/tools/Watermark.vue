<script setup lang="ts">
defineEmits<{ back: [] }>()

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
		const rad = (rotation.value * Math.PI) / 180; const sp = Math.max(tileSpacing.value, fontSize.value * 2)
		for (let r = -1; r < Math.ceil(h / sp) + 2; r++) for (let c = -1; c < Math.ceil(w / sp) + 2; c++) {
			ctx.save(); ctx.translate(c * sp + sp / 2, r * sp + sp / 2); ctx.rotate(rad)
			ctx.fillText(watermarkText.value, 0, 0); ctx.restore()
		}
	} else {
		const rad = (rotation.value * Math.PI) / 180; const pad = Math.max(fontSize.value * 1.5, 40)
		let x: number, y: number
		switch (position.value) { case 'tl': x = pad; y = pad + fontSize.value / 2; break; case 'tr': x = w - pad; y = pad + fontSize.value / 2; break; case 'bl': x = pad; y = h - pad - fontSize.value / 2; break; case 'br': x = w - pad; y = h - pad - fontSize.value / 2; break; default: x = w / 2; y = h / 2 }
		ctx.translate(x, y); ctx.rotate(rad); ctx.fillText(watermarkText.value, 0, 0)
	}
	ctx.restore(); resultUrl.value = canvas.toDataURL()
}

function download() {
	if (!canvasEl.value) return; downloading.value = true
	canvasEl.value.toBlob((blob) => {
		if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
		a.download = `watermarked${exportExt.value}`; a.click(); downloading.value = false
	}, exportFormat.value === 'image/png' ? 'image/png' : exportFormat.value, 0.9)
}

watch([watermarkText, fontSize, opacity, position, color, rotation, bold, tileSpacing], () => { if (originalUrl.value) applyWatermark() })
</script>

<template>
<div :style="{ padding: '1rem', maxWidth: '720px' }">
	<button :style="{ display: 'inline-flex', alignItems: 'center', gap: '0.3em', fontSize: '0.85em', color: 'var(--c-text-2)', cursor: 'pointer', marginBottom: '0.8rem' }" @click="$emit('back')"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1 :style="{ margin: 0, fontSize: '1.6em' }">图片水印</h1>
	<p :style="{ margin: '0.3em 0 1rem', fontSize: '0.9em', color: 'var(--c-text-2)' }">添加文字水印，支持平铺模式。纯浏览器端处理。</p>

	<label :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', border: '2px dashed var(--c-border)', borderRadius: '0.8em', cursor: 'pointer', marginBottom: '1rem', overflow: 'hidden' }" for="wm-input">
		<img v-if="resultUrl" :src="resultUrl" :style="{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }" alt="">
		<template v-else>
			<Icon name="tabler:cloud-upload" :style="{ fontSize: '2.5em', color: 'var(--c-text-3)' }" />
			<p :style="{ marginTop: '0.5em', fontSize: '0.9em', color: 'var(--c-text-3)' }">点击上传图片</p>
		</template>
	</label>
	<input id="wm-input" type="file" accept="image/*" hidden @change="handleFile">
	<canvas ref="canvasEl" style="display:none" />

	<div v-if="originalUrl" :style="{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }">
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">水印文字</span>
			<input v-model="watermarkText" type="text" placeholder="输入水印文字" :style="{ padding: '0.5em 0.7em', border: '1px solid var(--c-border)', borderRadius: '0.4em', background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.95em', outline: 'none', maxWidth: '100%' }">
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">水印模式</span>
			<div :style="{ display: 'flex', flexWrap: 'wrap', gap: '0.3em' }">
				<button v-for="opt in positionOptions" :key="opt.value" @click="position = opt.value" :style="{ padding: '0.4em 1em', border: `1px solid ${position === opt.value ? 'var(--c-primary)' : 'var(--c-border)'}`, borderRadius: '0.4em', fontSize: '0.9em', cursor: 'pointer', background: position === opt.value ? 'var(--c-primary-soft)' : 'transparent', color: position === opt.value ? 'var(--c-primary)' : 'var(--c-text-2)' }">{{ opt.label }}</button>
			</div>
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">字号：{{ fontSize }}px</span>
			<input type="range" min="12" max="200" v-model.number="fontSize" :style="{ width: '100%', accentColor: 'var(--c-primary)' }">
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">旋转：{{ rotation }}°</span>
			<input type="range" min="-90" max="90" v-model.number="rotation" :style="{ width: '100%', accentColor: 'var(--c-primary)' }">
		</div>
		<div v-if="position === 'tile'" :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">平铺间距：{{ tileSpacing }}px</span>
			<input type="range" min="80" max="500" step="10" v-model.number="tileSpacing" :style="{ width: '100%', accentColor: 'var(--c-primary)' }">
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">透明度：{{ Math.round(opacity * 100) }}%</span>
			<input type="range" min="0.05" max="1" step="0.05" v-model.number="opacity" :style="{ width: '100%', accentColor: 'var(--c-primary)' }">
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">字体加粗</span>
			<div :style="{ display: 'flex', gap: '0.3em' }">
				<button @click="bold = !bold" :style="{ padding: '0.4em 1em', border: `1px solid ${bold ? 'var(--c-primary)' : 'var(--c-border)'}`, borderRadius: '0.4em', fontSize: '0.9em', cursor: 'pointer', background: bold ? 'var(--c-primary-soft)' : 'transparent', color: bold ? 'var(--c-primary)' : 'var(--c-text-2)' }">{{ bold ? '开' : '关' }}</button>
			</div>
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">颜色</span>
			<div :style="{ display: 'flex', alignItems: 'center', gap: '0.4em' }">
				<input type="color" v-model="color" :style="{ width: '36px', height: '36px', border: 'none', borderRadius: '0.4em', cursor: 'pointer', padding: '2px' }">
				<button v-for="c in ['#ffffff','#000000','#ef4444']" :key="c" @click="color = c" :style="{ width: '28px', height: '28px', border: `2px solid ${color === c ? 'var(--c-primary)' : 'var(--c-border)'}`, borderRadius: '50%', cursor: 'pointer', background: c }" />
			</div>
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '0.2em' }">
			<span :style="{ fontSize: '0.85em', color: 'var(--c-text-2)' }">导出格式</span>
			<div :style="{ display: 'flex', gap: '0.3em' }">
				<button v-for="f in [{ v: 'image/png' as const, l: 'PNG' }, { v: 'image/jpeg' as const, l: 'JPEG' }, { v: 'image/webp' as const, l: 'WebP' }]" :key="f.v" @click="exportFormat = f.v" :style="{ padding: '0.4em 1em', border: `1px solid ${exportFormat === f.v ? 'var(--c-primary)' : 'var(--c-border)'}`, borderRadius: '0.4em', fontSize: '0.9em', cursor: 'pointer', background: exportFormat === f.v ? 'var(--c-primary-soft)' : 'transparent', color: exportFormat === f.v ? 'var(--c-primary)' : 'var(--c-text-2)' }">{{ f.l }}</button>
			</div>
		</div>
		<button @click="download" :disabled="!resultUrl || downloading" :style="{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4em', padding: '0.6em 1.5em', borderRadius: '0.5em', background: 'var(--c-primary)', color: '#fff', fontSize: '0.95em', cursor: (!resultUrl || downloading) ? 'not-allowed' : 'pointer', border: 'none', opacity: (!resultUrl || downloading) ? 0.5 : 1 }">
			<Icon name="tabler:download" /><span>{{ downloading ? '下载中...' : `下载 ${exportExt.value.replace('.','').toUpperCase()}` }}</span>
		</button>
	</div>
</div>
</template>
