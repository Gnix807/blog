<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
	title: '友圈',
	description: '汇聚友链博客的最新动态。',
})

interface FcArticle {
	title: string
	created: string
	link: string
	author: string
	avatar?: string
}

interface FcResponse {
	statistical_data?: {
		friends_num?: number
		active_num?: number
		article_num?: number
		last_updated_time?: string
	}
	article_data?: FcArticle[]
}

const data = ref<FcResponse | null>(null)
const loading = ref(true)
const failed = ref(false)

onMounted(async () => {
	if (!appConfig.friendCircleApi) {
		loading.value = false
		return
	}
	try {
		data.value = await $fetch<FcResponse>(appConfig.friendCircleApi)
	}
	catch {
		failed.value = true
	}
	finally {
		loading.value = false
	}
})

const articles = computed(() => data.value?.article_data ?? [])
const stats = computed(() => data.value?.statistical_data)
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetCommGroup />
</template>

<div class="fc-page">
	<h1 class="fc-heading text-creative">
		友圈
	</h1>

	<div v-if="stats" class="fc-stats">
		<span>{{ stats.friends_num ?? 0 }} 位朋友</span>
		<span>{{ stats.article_num ?? 0 }} 篇文章</span>
		<span v-if="stats.last_updated_time">更新于 {{ stats.last_updated_time }}</span>
	</div>

	<div v-if="loading" class="fc-hint">
		加载中……
	</div>

	<!-- 未配置后端 -->
	<div v-else-if="!appConfig.friendCircleApi" class="fc-hint card">
		<Icon name="tabler:rss" />
		<p>友圈需要一个聚合后端服务。部署 <a href="https://github.com/willow-god/Friend-Circle-Lite" target="_blank" rel="noopener">Friend-Circle-Lite</a> 等服务后，把返回 JSON 的接口地址填入 <code>app.config.ts</code> 的 <code>friendCircleApi</code> 即可。</p>
	</div>

	<div v-else-if="failed" class="fc-hint card">
		友圈数据加载失败，请检查 <code>friendCircleApi</code> 地址。
	</div>

	<menu v-else class="fc-list">
		<li v-for="(article, index) in articles" :key="index">
			<UtilLink :to="article.link" class="fc-item card" :title="article.title">
				<UtilImg v-if="article.avatar" class="fc-avatar" :src="article.avatar" :alt="article.author" />
				<div class="fc-info">
					<div class="fc-title">
						{{ article.title }}
					</div>
					<div class="fc-meta">
						<span class="fc-author">{{ article.author }}</span>
						<span class="fc-date">{{ article.created }}</span>
					</div>
				</div>
			</UtilLink>
		</li>
	</menu>
</div>
</template>

<style lang="scss" scoped>
.fc-page {
	padding: 1rem;
}

.fc-heading {
	font-size: 1.5em;
}

.fc-stats {
	display: flex;
	flex-wrap: wrap;
	gap: 1em;
	margin: 1rem 0;
	font-size: 0.85em;
	color: var(--c-text-2);
}

.fc-hint {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 1rem;
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

.fc-list {
	display: grid;
	gap: 0.8rem;
	margin: 1.5rem 0 0;
	padding: 0;
	list-style: none;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.fc-item {
	display: flex;
	align-items: center;
	gap: 0.6rem;
	padding: 0.8em 1em;

	.fc-avatar {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
	}

	.fc-info {
		overflow: hidden;
	}

	.fc-title {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--c-text);
	}

	.fc-meta {
		display: flex;
		justify-content: space-between;
		gap: 0.5em;
		margin-top: 0.2em;
		font-size: 0.78em;
		color: var(--c-text-3);
	}
}
</style>
