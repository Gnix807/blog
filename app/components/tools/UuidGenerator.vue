<script setup lang="ts">
defineEmits<{ back: [] }>()
const uuid = ref(crypto.randomUUID())
const count = ref(1)
const list = ref<string[]>([])

function generate() {
	const arr: string[] = []
	for (let i = 0; i < count.value; i++) arr.push(crypto.randomUUID())
	list.value = arr
}

function copyAll() {
	navigator.clipboard.writeText(list.value.join('\n'))
}

generate()
</script>

<template>
<div style="padding:1rem;max-width:720px">
	<button @click="$emit('back')" style="display:inline-flex;align-items:center;gap:0.3em;font-size:0.85em;color:var(--c-text-2);cursor:pointer;margin-bottom:0.8rem"><Icon name="tabler:arrow-left" /><span>工具箱</span></button>
	<h1 style="margin:0;font-size:1.6em">UUID 生成器</h1>
	<p style="margin:0.3em 0 1rem;font-size:0.9em;color:var(--c-text-2)">基于 crypto.randomUUID()，纯浏览器端。</p>

	<div style="display:flex;align-items:center;gap:0.5em;margin-bottom:1rem">
		<label style="font-size:0.85em;color:var(--c-text-2)">数量</label>
		<input v-model.number="count" type="number" min="1" max="50" style="width:60px;padding:0.4em;border:1px solid var(--c-border);border-radius:0.4em;background:var(--c-bg);color:var(--c-text);text-align:center">
		<button @click="generate" style="padding:0.4em 1em;border-radius:0.4em;background:var(--c-primary);color:#fff;cursor:pointer;border:none">生成</button>
		<button @click="copyAll" style="padding:0.4em 1em;border:1px solid var(--c-border);border-radius:0.4em;cursor:pointer;color:var(--c-text-2);background:transparent">复制全部</button>
	</div>

	<div v-for="(id, i) in list" :key="i" style="display:flex;align-items:center;gap:0.5em;padding:0.4em 0;border-bottom:1px solid var(--c-border);font-family:var(--font-mono),monospace;font-size:0.85em">
		<span style="color:var(--c-text-3);min-width:2em">{{ i + 1 }}</span>
		<code style="color:var(--c-text);word-break:break-all">{{ id }}</code>
	</div>
</div>
</template>
