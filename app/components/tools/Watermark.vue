<script setup lang="ts">
defineEmits<{ back: [] }>()

const originalUrl = ref('')
const watermarkText = ref('')

function handleFile(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = (ev) => {
		originalUrl.value = ev.target?.result as string
	}
	reader.readAsDataURL(file)
}
</script>

<template>
<div class="tool-page">
	<button class="back-link" @click="$emit('back')"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1>图片水印</h1>

	<label class="upload-zone" for="wm-input">
		<img v-if="originalUrl" :src="originalUrl" class="preview-img" alt="">
		<template v-else>
			<Icon name="tabler:cloud-upload" class="upload-icon" />
			<p class="upload-hint">点击上传图片</p>
		</template>
	</label>
	<input id="wm-input" type="file" accept="image/*" hidden @change="handleFile">

	<div v-if="originalUrl">
		<p>图片已加载 ✓</p>
		<input v-model="watermarkText" placeholder="水印文字" class="text-input">
	</div>
</div>
</template>

<style lang="scss" scoped>
.tool-page { padding: 1rem; max-width: 720px; }
.back-link { display: inline-flex; align-items: center; gap: 0.3em; font-size: 0.85em; color: var(--c-text-2); cursor: pointer; margin-bottom: 0.8rem; }
h1 { margin: 0; font-size: 1.6em; }
.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; border: 2px dashed var(--c-border); border-radius: 0.8em; cursor: pointer; margin-top: 1rem; .upload-icon { font-size: 2.5em; color: var(--c-text-3); } .upload-hint { margin-top: 0.5em; font-size: 0.9em; color: var(--c-text-3); } .preview-img { max-width: 100%; max-height: 400px; object-fit: contain; } }
.text-input { display: block; margin-top: 1rem; padding: 0.5em 0.7em; border: 1px solid var(--c-border); border-radius: 0.4em; background: var(--c-bg); color: var(--c-text); font-size: 0.95em; outline: none; width: 100%; max-width: 400px; }
</style>
