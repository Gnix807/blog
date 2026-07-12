<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
	title: '番剧',
	description: `${appConfig.author.name}的 B站追番列表。`,
})

interface BiliItem {
	season_id: number
	media_id: number
	title: string
	cover: string
	evaluate?: string
	follow_status: number
	total_count?: number
	new_ep?: { index_show?: string }
	badge?: string
}

const statusLabel: Record<number, string> = {
	1: '想看',
	2: '在看',
	3: '看过',
}

// 同源预渲染接口（/api/bilibili 在构建时于服务端抓取），客户端导航与刷新都不触发跨域/防盗链请求
const { data } = await useFetch('/api/bilibili', {
	default: () => ({ list: [] as BiliItem[], configured: false, failed: false }),
})

const configured = computed(() => data.value?.configured)
const failed = computed(() => data.value?.failed)

const filter = ref(0)
const filteredList = computed(() => {
	const all = data.value?.list ?? []
	return filter.value ? all.filter(i => i.follow_status === filter.value) : all
})

const { page, totalPages, listPaged: list } = usePagination(filteredList, { perPage: 25 })
watch(filter, () => {
	page.value = 1
})

function mediaLink(item: BiliItem) {
	return `https://www.bilibili.com/bangumi/media/md${item.media_id}`
}
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

	<div v-if="!configured" class="anime-hint card">
		<Icon name="tabler:brand-bilibili" />
		<p>在 <code>nuxt.config.ts</code> 的 <code>runtimeConfig.public.biliUid</code> 填入你的 B站 UID（追番列表设为公开），即可展示追番。若构建时被 B站风控，可部署代理并填 <code>biliApi</code>。</p>
	</div>

	<div v-else-if="failed" class="anime-hint card">
		追番数据获取失败（可能被 B站风控或列表未公开）。可尝试填写 <code>biliApi</code> 代理接口。
	</div>

	<template v-else>
		<div class="anime-tabs">
			<ZButton text="全部" :primary="filter === 0" @click="filter = 0" />
			<ZButton text="想看" :primary="filter === 1" @click="filter = 1" />
			<ZButton text="在看" :primary="filter === 2" @click="filter = 2" />
			<ZButton text="看过" :primary="filter === 3" @click="filter = 3" />
		</div>

		<div class="anime-grid">
			<UtilLink
				v-for="item in list"
				:key="item.media_id"
				:to="mediaLink(item)"
				class="anime-card"
				:title="item.title"
			>
				<div class="anime-cover">
					<img :src="item.cover" :alt="item.title" referrerpolicy="no-referrer" loading="lazy">
					<span class="anime-status">{{ statusLabel[item.follow_status] ?? '追番' }}</span>
				</div>
				<div class="anime-name">
					{{ item.title }}
				</div>
				<div v-if="item.new_ep?.index_show" class="anime-ep">
					{{ item.new_ep.index_show }}
				</div>
			</UtilLink>
		</div>

		<ZPagination v-if="totalPages > 1" v-model="page" :total-pages="totalPages" />
	</template>
</div>
</template>

<style lang="scss" scoped>
.anime-page {
	padding: 1rem;
}

.anime-heading {
	font-size: 1.5em;
	margin-bottom: 1rem;
}

.anime-hint {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	padding: 1rem;
	font-size: 0.9em;
	line-height: 1.6;
	color: var(--c-text-2);

	> .iconify {
		flex-shrink: 0;
		margin-top: 0.2em;
		font-size: 1.3em;
	}

	code {
		padding: 0.1em 0.3em;
		border-radius: 0.3em;
		background-color: var(--c-bg-2);
	}
}

.anime-tabs {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1rem;
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

		.anime-status {
			position: absolute;
			bottom: 0.3rem;
			inset-inline-start: 0.3rem;
			padding: 0.1em 0.4em;
			border-radius: 0.3em;
			background-color: var(--c-bg-a80);
			font-size: 0.72em;
			color: var(--c-primary);
			backdrop-filter: blur(4px);
		}
	}

	&:hover .anime-cover img {
		transform: scale(1.05);
	}

	.anime-name {
		margin-top: 0.4rem;
		font-size: 0.8em;
		line-height: 1.3;
		color: var(--c-text-1);
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.anime-ep {
		margin-top: 0.2rem;
		font-size: 0.72em;
		color: var(--c-text-3);
	}
}
</style>
