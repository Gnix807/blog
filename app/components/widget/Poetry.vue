<script setup lang="ts">
interface Hitokoto {
	hitokoto: string
	from?: string
	from_who?: string
}

const sentence = ref<Hitokoto | null>(null)
const loading = ref(true)

async function fetchOne() {
	loading.value = true
	try {
		sentence.value = await $fetch<Hitokoto>('https://v1.hitokoto.cn/')
	}
	catch {
		sentence.value = { hitokoto: '生活明朗，万物可爱。' }
	}
	finally {
		loading.value = false
	}
}

onMounted(fetchOne)
</script>

<template>
<BlogWidget card title="一言">
	<div class="hitokoto" :class="{ loading }" @click="fetchOne">
		<p class="hitokoto-text">
			{{ sentence?.hitokoto ?? '加载中……' }}
		</p>
		<p v-if="sentence?.from || sentence?.from_who" class="hitokoto-from">
			——{{ [sentence?.from_who, sentence?.from].filter(Boolean).join('·') }}
		</p>
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.hitokoto {
	font-size: 0.9em;
	line-height: 1.7;
	color: var(--c-text-2);
	cursor: pointer;
	transition: opacity 0.2s;

	&.loading {
		opacity: 0.5;
	}

	.hitokoto-text {
		margin: 0;
	}

	.hitokoto-from {
		margin: 0.5em 0 0;
		font-size: 0.85em;
		text-align: right;
		color: var(--c-text-3);
	}
}
</style>
