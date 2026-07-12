<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { orderBy } from 'es-toolkit/array'

const appConfig = useAppConfig()
useSeoMeta({
	title: '标签',
	description: `${appConfig.title}的所有文章标签。`,
})

const { data: listRaw } = await useAsyncData('posts:index', () => getArticleIndexOptions(), { default: () => [] })

const selectedTag = useRouteQuery<string | undefined>('tag', undefined)

const tagList = computed(() => {
	const map = new Map<string, number>()
	for (const article of listRaw.value) {
		for (const tag of article.tags ?? [])
			map.set(tag, (map.get(tag) ?? 0) + 1)
	}
	return orderBy([...map.entries()].map(([name, count]) => ({ name, count })), ['count'], ['desc'])
})

const filteredList = computed(() => selectedTag.value
	? orderBy(listRaw.value.filter(a => a.tags?.includes(selectedTag.value!)), ['date'], ['desc'])
	: [],
)

function fontSize(count: number) {
	const max = tagList.value[0]?.count ?? 1
	return `${0.8 + (count / max) * 0.9}em`
}
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetBlogTech />
</template>

<div class="tags-page">
	<h1 class="tags-heading text-creative">
		标签
	</h1>

	<div class="tag-cloud">
		<UtilLink
			v-for="tag in tagList"
			:key="tag.name"
			:to="selectedTag === tag.name ? '/tags' : `/tags?tag=${encodeURIComponent(tag.name)}`"
			class="tag-chip"
			:class="{ active: selectedTag === tag.name }"
			:style="{ fontSize: fontSize(tag.count) }"
		>
			<Icon name="tabler:hash" />{{ tag.name }}
			<span class="tag-count">{{ tag.count }}</span>
		</UtilLink>
	</div>

	<template v-if="selectedTag">
		<h2 class="tags-subheading">
			<Icon name="tabler:hash" />{{ selectedTag }}
			<span class="tags-subcount">共 {{ filteredList.length }} 篇</span>
		</h2>
		<TransitionGroup tag="menu" class="tags-list" name="float-in">
			<PostArchive
				v-for="article, index in filteredList"
				:key="article.path"
				v-bind="article"
				:to="article.path"
				:style="getFixedDelay(index * 0.03)"
			/>
		</TransitionGroup>
	</template>
</div>
</template>

<style lang="scss" scoped>
.tags-page {
	padding: 1rem;
}

.tags-heading {
	font-size: 1.5em;
}

.tag-cloud {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5em;
	margin: 1.5rem 0;
}

.tag-chip {
	display: inline-flex;
	align-items: center;
	gap: 0.1em;
	padding: 0.2em 0.7em;
	border-radius: 1em;
	background-color: var(--c-bg-2);
	color: var(--c-text-2);
	line-height: 1.6;
	transition: all 0.2s;

	&:hover {
		background-color: var(--c-bg-soft);
		color: var(--c-text);
	}

	&.active {
		background-color: var(--c-primary-soft);
		color: var(--c-primary);
	}

	.tag-count {
		font-size: 0.7em;
		opacity: 0.7;
	}
}

.tags-subheading {
	display: flex;
	align-items: center;
	gap: 0.2em;
	margin: 1.5rem 0 1rem;
	font-size: 1.2em;
	color: var(--c-text);

	.tags-subcount {
		font-size: 0.7em;
		color: var(--c-text-3);
	}
}

.tags-list {
	display: grid;
	margin: 0;
	padding: 0;
}
</style>
