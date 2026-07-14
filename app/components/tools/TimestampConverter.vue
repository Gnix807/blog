<script setup lang="ts">
defineEmits<{ back: [] }>()
const now = ref(Date.now())
const tsInput = ref('')
const tsResult = ref('')
const formatInput = ref('')
const formatResult = ref('')

setInterval(() => { now.value = Date.now() }, 1000)

watchEffect(() => {
	if (!tsInput.value.trim()) { tsResult.value = ''; return }
	const n = Number(tsInput.value)
	if (isNaN(n)) { tsResult.value = '无效时间戳'; return }
	const d = new Date(n < 1e12 ? n * 1000 : n)
	tsResult.value = d.toLocaleString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })
})

function getNowTs() {
	tsInput.value = String(Math.floor(Date.now() / 1000))
}

function convertFormat() {
	if (!formatInput.value.trim()) { formatResult.value = ''; return }
	const d = new Date(formatInput.value)
	if (isNaN(d.getTime())) {
		const n = Number(formatInput.value)
		if (!isNaN(n)) {
			const d2 = new Date(n < 1e12 ? n * 1000 : n)
			formatResult.value = `秒级时间戳：${Math.floor(d2.getTime() / 1000)}\n毫秒时间戳：${d2.getTime()}\n本地时间：${d2.toLocaleString('zh-CN')}\nISO：${d2.toISOString()}`
			return
		}
		formatResult.value = '无法解析'
		return
	}
	formatResult.value = `秒级时间戳：${Math.floor(d.getTime() / 1000)}\n毫秒时间戳：${d.getTime()}\n本地时间：${d.toLocaleString('zh-CN')}\nISO：${d.toISOString()}`
}
</script>

<template>
<div style="padding:1rem;max-width:720px">
	<button @click="$emit('back')" style="display:inline-flex;align-items:center;gap:0.3em;font-size:0.85em;color:var(--c-text-2);cursor:pointer;margin-bottom:0.8rem"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1 style="margin:0;font-size:1.6em">时间戳转换</h1>
	<p style="margin:0.3em 0 1rem;font-size:0.9em;color:var(--c-text-2)">当前时间戳：{{ now }}（{{ Math.floor(now/1000) }}）</p>

	<div style="margin-bottom:1.2rem">
		<h3 style="margin:0 0 0.5em;font-size:1em">时间戳 → 日期</h3>
		<div style="display:flex;gap:0.3em">
			<input v-model="tsInput" placeholder="输入秒级或毫秒时间戳" style="flex:1;padding:0.5em 0.7em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg);color:var(--c-text);font-size:0.95em;outline:none">
			<button @click="getNowTs" style="padding:0.4em 0.8em;border:1px solid var(--c-border);border-radius:0.4em;cursor:pointer;font-size:0.85em;color:var(--c-text-2);background:transparent;white-space:nowrap">当前</button>
		</div>
		<pre v-if="tsResult" style="margin-top:0.5em;padding:0.6em;border-radius:0.4em;background:var(--c-bg-soft);font-size:0.95em;color:var(--c-text);white-space:pre-wrap">{{ tsResult }}</pre>
	</div>

	<div>
		<h3 style="margin:0 0 0.5em;font-size:1em">日期 / 时间戳 → 转换</h3>
		<input v-model="formatInput" placeholder="输入日期(2026-04-15)或时间戳" @input="convertFormat" style="width:100%;padding:0.5em 0.7em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg);color:var(--c-text);font-size:0.95em;outline:none;box-sizing:border-box">
		<pre v-if="formatResult" style="margin-top:0.5em;padding:0.6em;border-radius:0.4em;background:var(--c-bg-soft);font-size:0.9em;color:var(--c-text);white-space:pre-wrap;line-height:1.6">{{ formatResult }}</pre>
	</div>
</div>
</template>
