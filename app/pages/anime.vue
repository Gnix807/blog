<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
	title: '番剧',
	description: `${appConfig.author.name}追过的番剧收藏。`,
})

interface BgmSubject {
	id: number
	name: string
	name_cn: string
	images: { common: string, medium: string }
	score?: number
}

interface BgmCollection {
	subject_id: number
	subject: BgmSubject
	rate: number
	type: number
}

const list = ref<BgmCollection[]>([])
const loading = ref(true)
const failed = ref(false)

const typeLabel: Record<number, string> = {
	1: '想看',
	2: '看过',
	3: '在看',
	4: '搁置',
	5: '抛弃',
}

onMounted(async () => {
	if (!appConfig.bangumiUser) {
		loading.value = false
		return
	}
	try {
		const res = await $fetch<{ data: BgmCollection[] }>(
			`https://api.bgm.tv/v0/users/${appConfig.bangumiUser}/collections`,
			{ params: { subject_type: 2, limit: 50 } },
		)
		list.value = res.data ?? []
	}
	catch {
		failed.value = true
	}
	finally {
		loading.value = false
	}
})
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetCommGroup />
</template>

<div class="anime-page">
	<h1 class="anime-heading text-creative">
		番剧
	</h1>

	<div v-if="loading" class="anime-hint">
		加载中……
	</div>

	<div v-else-if="!appConfig.bangumiUser" class="anime-hint card">
		<Icon name="tabler:movie" />
		<p>在 <code>app.config.ts</code> 的 <code>bangumiUser</code> 填入你的 <a href="https://bgm.tv/" target="_blank" rel="noopener">Bangumi</a> 用户名，即可自动展示你的番剧收藏。</p>
	</div>

	<div v-else-if="failed" class="anime-hint card">
		番剧数据加载失败，请检查 <code>bangumiUser</code> 是否正确、收藏是否公开。
	</div>

	<div v-else class="anime-grid">
		<UtilLink
			v-for="item in list"
			:key="item.subject_id"
			:to="`https://bgm.tv/subject/${item.subject_id}`"
			class="anime-card"
			:title="item.subject.name_cn || item.subject.name"
		>
			<div class="anime-cover">
				<UtilImg :src="item.subject.images?.common" :alt="item.subject.name" />
				<span v-if="item.rate" class="anime-rate">★ {{ item.rate }}</span>
				<span class="anime-type">{{ typeLabel[item.type] }}</span>
			</div>
			<div class="anime-name">
				{{ item.subject.name_cn || item.subject.name }}
			</div>
		</UtilLink>
	</div>
</div>
</template>

<style lang="scss" scoped>
.anime-page {
	padding: 1rem;
}

.anime-heading {
	font-size: 1.5em;
	margin-bottom: 1.5rem;
}

.anime-hint {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 1rem;
	font-size: 0.9em;
	color: var(--c-text-2);

	code {
		padding: 0.1em 0.3em;
		border-radius: 0.3em;
		background-color: var(--c-bg-2);
	}

	a {
		color: var(--c-primary);
	}
}

.anime-grid {
	display: grid;
	gap: 0.8rem;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.anime-card {
	.anime-cover {
		position: relative;
		overflow: hidden;
		aspect-ratio: 0.72;
		border-radius: 0.5rem;
		box-shadow: var(--box-shadow-2);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.3s;
		}

		.anime-rate, .anime-type {
			position: absolute;
			padding: 0.1em 0.4em;
			border-radius: 0.3em;
			background-color: var(--c-bg-a80);
			font-size: 0.72em;
			backdrop-filter: blur(4px);
		}

		.anime-rate {
			top: 0.3rem;
			inset-inline-end: 0.3rem;
			color: var(--c-warning);
		}

		.anime-type {
			bottom: 0.3rem;
			inset-inline-start: 0.3rem;
			color: var(--c-text-2);
		}
	}

	&:hover .anime-cover img {
		transform: scale(1.05);
	}

	.anime-name {
		margin-top: 0.4rem;
		font-size: 0.8em;
		line-height: 1.3;
		text-align: center;
		color: var(--c-text-1);
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
}
</style>
