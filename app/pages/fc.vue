<script setup lang="ts">
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

// 同源预渲染接口：/api/friend-circle 在构建时于服务端抓取并聚合各友链 RSS，无需外部后端、无跨域
const { data } = await useFetch<FcResponse>('/api/friend-circle', {
	default: () => ({ statistical_data: {}, article_data: [] as FcArticle[] }),
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

	<div v-if="stats && (stats.friends_num || stats.article_num)" class="fc-stats">
		<span>{{ stats.friends_num ?? 0 }} 位朋友</span>
		<span>{{ stats.article_num ?? 0 }} 篇文章</span>
		<span v-if="stats.last_updated_time">更新于 {{ stats.last_updated_time }}</span>
	</div>

	<!-- 暂无可聚合的友链订阅源 -->
	<div v-if="!articles.length" class="fc-hint card">
		<Icon name="tabler:rss" />
		<p>暂无友圈动态。请在 <code>app/feeds.ts</code> 中添加带有 <code>feed</code>（RSS/Atom 订阅源）的友链，构建时会自动抓取聚合。</p>
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
