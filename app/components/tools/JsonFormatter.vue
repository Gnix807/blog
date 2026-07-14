<script setup lang="ts">
defineEmits<{ back: [] }>()
const input = ref('')
const output = ref('')
const error = ref('')
const indent = ref(2)
const action = ref<'format' | 'compact' | 'sort'>('format')

function doFormat() {
	action.value = 'format'
	error.value = ''
	if (!input.value.trim()) { output.value = ''; return }
	try {
		output.value = JSON.stringify(JSON.parse(input.value), null, indent.value)
	} catch (e: any) {
		error.value = 'JSON 解析失败：' + e.message
		output.value = ''
	}
}

function doCompact() {
	action.value = 'compact'
	error.value = ''
	if (!input.value.trim()) { output.value = ''; return }
	try {
		output.value = JSON.stringify(JSON.parse(input.value))
	} catch (e: any) {
		error.value = 'JSON 解析失败：' + e.message
		output.value = ''
	}
}

function doSort() {
	action.value = 'sort'
	error.value = ''
	if (!input.value.trim()) { output.value = ''; return }
	try {
		const obj = JSON.parse(input.value)
		const sorted = sortKeys(obj)
		output.value = JSON.stringify(sorted, null, indent.value)
	} catch (e: any) {
		error.value = 'JSON 解析失败：' + e.message
		output.value = ''
	}
}

function sortKeys(obj: any): any {
	if (Array.isArray(obj)) return obj.map(sortKeys)
	if (obj && typeof obj === 'object')
		return Object.keys(obj).sort().reduce((acc: any, k) => { acc[k] = sortKeys(obj[k]); return acc }, {})
	return obj
}

watchEffect(() => { if (input.value) doFormat() })
</script>

<template>
<div style="padding:1rem;max-width:720px">
	<button @click="$emit('back')" style="display:inline-flex;align-items:center;gap:0.3em;font-size:0.85em;color:var(--c-text-2);cursor:pointer;margin-bottom:0.8rem"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1 style="margin:0;font-size:1.6em">JSON 格式化</h1>
	<p style="margin:0.3em 0 1rem;font-size:0.9em;color:var(--c-text-2)">纯浏览器端，数据不上传。</p>
	<div style="display:flex;flex-wrap:wrap;gap:0.3em;margin-bottom:0.8rem">
		<button @click="doFormat" :style="{ padding:'0.4em 1em', border:'1px solid var(--c-border)', borderRadius:'0.4em', cursor:'pointer', background: action==='format'?'var(--c-primary-soft)':'transparent', color: action==='format'?'var(--c-primary)':'var(--c-text-2)', transition:'all 0.15s' }">格式化</button>
		<button @click="doCompact" :style="{ padding:'0.4em 1em', border:'1px solid var(--c-border)', borderRadius:'0.4em', cursor:'pointer', background: action==='compact'?'var(--c-primary-soft)':'transparent', color: action==='compact'?'var(--c-primary)':'var(--c-text-2)', transition:'all 0.15s' }">压缩</button>
		<button @click="doSort" :style="{ padding:'0.4em 1em', border:'1px solid var(--c-border)', borderRadius:'0.4em', cursor:'pointer', background: action==='sort'?'var(--c-primary-soft)':'transparent', color: action==='sort'?'var(--c-primary)':'var(--c-text-2)', transition:'all 0.15s' }">按 key 排序</button>
		<select v-model.number="indent" style="padding:0.4em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg);color:var(--c-text);font-size:0.9em">
			<option :value="2">2 空格</option>
			<option :value="4">4 空格</option>
			<option :value="0">Tab</option>
		</select>
	</div>
	<textarea v-model="input" placeholder="粘贴 JSON..." style="width:100%;min-height:150px;padding:0.6em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg);color:var(--c-text);font-size:0.9em;resize:vertical;outline:none;font-family:var(--font-mono),monospace;box-sizing:border-box" />
	<p v-if="error" style="color:#ef4444;font-size:0.85em;margin-top:0.5em">{{ error }}</p>
	<textarea v-if="output" :value="output" readonly style="width:100%;min-height:150px;padding:0.6em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg-soft);color:var(--c-text);font-size:0.9em;resize:vertical;outline:none;margin-top:0.8em;font-family:var(--font-mono),monospace;box-sizing:border-box" />
</div>
</template>
