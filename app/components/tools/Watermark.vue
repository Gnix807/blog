<script setup lang="ts">
defineEmits<{ back: [] }>()

function handleFile(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0]
	if (file) alert('选中: ' + file.name)
}
</script>

<template>
<div class="tool-page">
	<button class="back-link" @click="$emit('back')"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1>水印测试</h1>
	<label class="upload-zone" for="wm-input">
		<Icon name="tabler:cloud-upload" class="upload-icon" />
		<p class="upload-hint">点击选择图片</p>
	</label>
	<input id="wm-input" type="file" accept="image/*" hidden @change="handleFile">
</div>
</template>

<style lang="scss" scoped>
.tool-page { padding: 1rem; max-width: 720px; }
.back-link { display: inline-flex; align-items: center; gap: 0.3em; font-size: 0.85em; color: var(--c-text-2); cursor: pointer; margin-bottom: 0.8rem; }
h1 { margin: 0; font-size: 1.6em; }
.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; border: 2px dashed var(--c-border); border-radius: 0.8em; cursor: pointer; margin-top: 1rem; .upload-icon { font-size: 2.5em; color: var(--c-text-3); } .upload-hint { margin-top: 0.5em; font-size: 0.9em; color: var(--c-text-3); } }
</style>
