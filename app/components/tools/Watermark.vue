<script setup lang="ts">
defineEmits<{ back: [] }>()
</script>

<template>
<div style="padding:1rem">
	<button @click="$emit('back')">
		<Icon name="tabler:arrow-left" />
		返回
	</button>
	<h1>图片水印 - 测试</h1>
	<p>如果你看到这行字，说明组件加载正常。</p>
	<input type="file" @change="(e) => console.log('file selected', (e.target as HTMLInputElement).files?.[0])">
</div>
</template>
