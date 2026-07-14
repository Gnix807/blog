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
<div class="tool-page">
	<button class="back-link" @click="$emit('back')"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1>图片水印 - 测试3</h1>
	<p>全量脚本 + 简化模板</p>

	<label class="upload-zone" for="wm-input">
		<img v-if="resultUrl" :src="resultUrl" class="preview-img" alt="">
		<template v-else>
			<Icon name="tabler:cloud-upload" class="upload-icon" />
			<p class="upload-hint">点击上传图片</p>
		</template>
	</label>
	<input id="wm-input" type="file" accept="image/*" hidden @change="handleFile">
	<canvas ref="canvasEl" style="display:none" />

	<div v-if="originalUrl" style="margin-top:1rem">
		<p>✓ 图片已加载</p>
		<input v-model="watermarkText" placeholder="水印文字" style="padding:0.5em;border:1px solid var(--c-border);border-radius:0.4em;width:100%;max-width:300px">

		<div style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2);margin-bottom:0.3em">水印模式</div>
			<button v-for="opt in positionOptions" :key="opt.value" :style="{ padding:'0.3em 0.8em', marginRight:'0.3em', border:'1px solid var(--c-border)', borderRadius:'0.4em', cursor:'pointer', background: position === opt.value ? 'var(--c-primary-soft)' : 'transparent', color: position === opt.value ? 'var(--c-primary)' : 'var(--c-text-2)' }" @click="position = opt.value">{{ opt.label }}</button>
		</div>

		<div style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2)">字号：{{ fontSize }}px</div>
			<input type="range" min="12" max="200" v-model.number="fontSize" style="width:100%;margin-top:0.2em">
		</div>

		<div style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2)">旋转：{{ rotation }}°</div>
			<input type="range" min="-90" max="90" v-model.number="rotation" style="width:100%;margin-top:0.2em">
		</div>

		<div style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2)">透明度：{{ Math.round(opacity * 100) }}%</div>
			<input type="range" min="0.05" max="1" step="0.05" v-model.number="opacity" style="width:100%;margin-top:0.2em">
		</div>

		<div style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2)">字体加粗</div>
			<button @click="bold = !bold" :style="{ padding:'0.3em 0.8em', border:'1px solid var(--c-border)', borderRadius:'0.4em', cursor:'pointer', background: bold ? 'var(--c-primary-soft)' : 'transparent', color: bold ? 'var(--c-primary)' : 'var(--c-text-2)' }">{{ bold ? '开' : '关' }}</button>
		</div>

		<div v-if="position === 'tile'" style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2)">平铺间距：{{ tileSpacing }}px</div>
			<input type="range" min="80" max="500" step="10" v-model.number="tileSpacing" style="width:100%;margin-top:0.2em">
		</div>

		<div style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2);margin-bottom:0.3em">颜色</div>
			<div style="display:flex;align-items:center;gap:0.4em">
				<input type="color" v-model="color" style="width:36px;height:36px;border:none;border-radius:0.4em;cursor:pointer;padding:2px">
				<button v-for="c in ['#ffffff','#000000','#ef4444']" :key="c" @click="color = c" :style="{ width:'28px', height:'28px', border:`2px solid ${color===c?'var(--c-primary)':'var(--c-border)'}`, borderRadius:'50%', cursor:'pointer', background:c }" />
			</div>
		</div>

		<div style="margin-top:0.8rem">
			<div style="font-size:0.85em;color:var(--c-text-2);margin-bottom:0.3em">导出格式</div>
			<div style="display:flex;gap:0.3em">
				<button @click="exportFormat = 'image/png'" :style="{ padding:'0.3em 0.8em', border:`1px solid ${exportFormat==='image/png'?'var(--c-primary)':'var(--c-border)'}`, borderRadius:'0.4em', cursor:'pointer', fontSize:'0.9em', background: exportFormat==='image/png'?'var(--c-primary-soft)':'transparent', color: exportFormat==='image/png'?'var(--c-primary)':'var(--c-text-2)' }">PNG</button>
				<button @click="exportFormat = 'image/jpeg'" :style="{ padding:'0.3em 0.8em', border:`1px solid ${exportFormat==='image/jpeg'?'var(--c-primary)':'var(--c-border)'}`, borderRadius:'0.4em', cursor:'pointer', fontSize:'0.9em', background: exportFormat==='image/jpeg'?'var(--c-primary-soft)':'transparent', color: exportFormat==='image/jpeg'?'var(--c-primary)':'var(--c-text-2)' }">JPEG</button>
				<button @click="exportFormat = 'image/webp'" :style="{ padding:'0.3em 0.8em', border:`1px solid ${exportFormat==='image/webp'?'var(--c-primary)':'var(--c-border)'}`, borderRadius:'0.4em', cursor:'pointer', fontSize:'0.9em', background: exportFormat==='image/webp'?'var(--c-primary-soft)':'transparent', color: exportFormat==='image/webp'?'var(--c-primary)':'var(--c-text-2)' }">WebP</button>
			</div>
		</div>

		<button @click="download" :disabled="!resultUrl || downloading" :style="{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.4em', padding:'0.6em 1.5em', borderRadius:'0.5em', background:'var(--c-primary)', color:'#fff', fontSize:'0.95em', marginTop:'0.5em', cursor: (!resultUrl||downloading) ? 'not-allowed' : 'pointer', border:'none', opacity: (!resultUrl||downloading) ? 0.5 : 1 }">
			<Icon name="tabler:download" /><span>{{ downloading ? '下载中...' : `下载 ${exportExt.value.replace('.','').toUpperCase()}` }}</span>
		</button>
	</div>
</div>
</template>

<style lang="scss" scoped>
.tool-page { padding: 1rem; max-width: 720px; }
.back-link { display: inline-flex; align-items: center; gap: 0.3em; font-size: 0.85em; color: var(--c-text-2); cursor: pointer; margin-bottom: 0.8rem; }
h1 { margin: 0; font-size: 1.6em; }
.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; border: 2px dashed var(--c-border); border-radius: 0.8em; cursor: pointer; margin-bottom: 1rem; overflow: hidden; &:hover { border-color: var(--c-primary); background: var(--c-bg-soft); } .upload-icon { font-size: 2.5em; color: var(--c-text-3); } .upload-hint { margin-top: 0.5em; font-size: 0.9em; color: var(--c-text-3); } .preview-img { max-width: 100%; max-height: 400px; object-fit: contain; } }
</style>
