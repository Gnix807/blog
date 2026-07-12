<script setup lang="ts">
import { orderBy } from 'es-toolkit/array'
import ContentPic from '~/components/content/Pic.vue'
import { moments } from '~/moments'

const appConfig = useAppConfig()
useSeoMeta({
	title: '即刻',
	ogType: 'profile',
	description: `${appConfig.author.name}的碎碎念与日常动态。`,
})

const list = computed(() => orderBy(moments, ['createdAt'], ['desc']))

function formatContent(text: string) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
		.replace(/\n/g, '<br>')
}
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetCommGroup />
</template>

<div class="page-essay">
	<h1 class="essay-heading text-creative">
		即刻
	</h1>

	<TransitionGroup tag="div" class="talk-list" name="float-in">
		<article
			v-for="(item, index) in list"
			:key="index"
			class="talk-item"
			:style="getFixedDelay(index * 0.05)"
		>
			<div class="talk-meta">
				<UtilImg class="avatar" :src="appConfig.author.avatar" :alt="appConfig.author.name" />
				<div class="info">
					<div class="talk-nick">
						{{ appConfig.author.name }}
					</div>
					<UtilDate class="talk-date" :date="item.createdAt" />
				</div>
			</div>

			<div class="talk-content" v-html="formatContent(item.content)" />

			<div
				v-if="item.images?.length"
				class="talk-images"
				:class="`count-${item.images.length}`"
			>
				<ContentPic
					v-for="(img, i) in item.images"
					:key="i"
					class="talk-image"
					:src="img"
					:alt="`图片${i + 1}`"
				/>
			</div>

			<div class="talk-bottom">
				<div class="talk-tags">
					<span v-for="tag in item.tags" :key="tag" class="tag">
						<Icon name="tabler:hash" />{{ tag }}
					</span>
				</div>
				<span v-if="item.location" class="location">
					<Icon name="tabler:map-pin" />{{ item.location }}
				</span>
			</div>
		</article>
	</TransitionGroup>
</div>
</template>

<style lang="scss" scoped>
.page-essay {
	padding: 1rem;
}

.essay-heading {
	font-size: 1.5em;
	margin-bottom: 1.5rem;
}

.talk-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.talk-item {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	padding: 1rem;
	border-radius: 0.5rem;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	background-color: var(--ld-bg-card);
}

.talk-meta {
	display: flex;
	align-items: center;
	gap: 0.6rem;

	.avatar {
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 50%;
		box-shadow: 2px 4px 1rem var(--ld-shadow);
	}

	.talk-nick {
		font-weight: 600;
		color: var(--c-text);
	}

	.talk-date {
		font-size: 0.8em;
		color: var(--c-text-3);
	}
}

.talk-content {
	line-height: 1.75;
	color: var(--c-text-1);
	word-break: break-word;

	:deep(a) {
		color: var(--c-primary);
	}
}

.talk-images {
	display: grid;
	gap: 4px;
	grid-template-columns: repeat(3, 1fr);

	&.count-1 {
		grid-template-columns: minmax(0, 62%);
	}

	&.count-2, &.count-4 {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.talk-image {
		margin: 0;

		:deep(figcaption) {
			display: none;
		}

		:deep(img) {
			width: 100%;
			aspect-ratio: 1;
			border-radius: 0.4rem;
			object-fit: cover;
		}
	}
}

.talk-bottom {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.5em;
	font-size: 0.8em;
	color: var(--c-text-3);

	.talk-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;

		.tag {
			display: inline-flex;
			align-items: center;
			padding: 0.1em 0.6em;
			border-radius: 1em;
			background-color: var(--c-bg-2);
			color: var(--c-primary);
		}
	}

	.location {
		display: inline-flex;
		align-items: center;
		gap: 0.1em;
	}
}
</style>
