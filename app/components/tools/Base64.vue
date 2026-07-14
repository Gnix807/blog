<script setup lang="ts">
defineEmits<{ back: [] }>()

const input = ref('')
const output = ref('')
const mode = ref<'encode' | 'decode'>('encode')
const error = ref('')

function convert() {
	error.value = ''
	if (!input.value) { output.value = ''; return }
	try {
		output.value = mode.value === 'encode'
			? btoa(unescape(encodeURIComponent(input.value)))
			: decodeURIComponent(escape(atob(input.value)))
	} catch {
		error.value = '输入内容无效，无法' + (mode.value === 'encode' ? '编码' : '解码')
		output.value = ''
	}
}

watchEffect(convert)
</script>

<template>
<div style="padding:1rem;max-width:720px">
	<button @click="$emit('back')" style="display:inline-flex;align-items:center;gap:0.3em;font-size:0.85em;color:var(--c-text-2);cursor:pointer;margin-bottom:0.8rem"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1 style="margin:0;font-size:1.6em">Base64 编解码</h1>
	<p style="margin:0.3em 0 1rem;font-size:0.9em;color:var(--c-text-2)">纯浏览器端，数据不上传。</p>

	<div style="display:flex;gap:0.3em;margin-bottom:0.8rem">
		<button @click="mode = 'encode'" :style="{ padding:'0.4em 1em', border:'1px solid var(--c-border)', borderRadius:'0.4em', cursor:'pointer', background: mode==='encode'?'var(--c-primary-soft)':'transparent', color: mode==='encode'?'var(--c-primary)':'var(--c-text-2)' }">编码</button>
		<button @click="mode = 'decode'" :style="{ padding:'0.4em 1em', border:'1px solid var(--c-border)', borderRadius:'0.4em', cursor:'pointer', background: mode==='decode'?'var(--c-primary-soft)':'transparent', color: mode==='decode'?'var(--c-primary)':'var(--c-text-2)' }">解码</button>
	</div>

	<textarea v-model="input" :placeholder="mode === 'encode' ? '输入原文...' : '输入 Base64...'" style="width:100%;min-height:120px;padding:0.6em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg);color:var(--c-text);font-size:0.95em;resize:vertical;outline:none;font-family:var(--font-mono),monospace;box-sizing:border-box" />

	<p v-if="error" style="color:#ef4444;font-size:0.85em;margin-top:0.5em">{{ error }}</p>

	<textarea v-if="output" :value="output" readonly style="width:100%;min-height:120px;padding:0.6em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg-soft);color:var(--c-text);font-size:0.95em;resize:vertical;outline:none;margin-top:0.8em;font-family:var(--font-mono),monospace;box-sizing:border-box" />
</div>
</template>
