<script setup lang="ts">
import { orderBy } from 'es-toolkit/array'
import { moments } from '~/moments'

const appConfig = useAppConfig()
useSeoMeta({
	title: '即刻',
	description: `${appConfig.author.name}的碎碎念与日常动态。`,
})

const list = computed(() => orderBy(moments, ['date'], ['desc']))
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetCommGroup />
</template>

<div class="essays-page">
	<h1 class="essays-heading text-creative">
		即刻
	</h1>

	<menu class="essays-list">
		<li v-for="(moment, index) in list" :key="index" class="essay-item card">
			<div class="essay-avatar">
				<UtilImg :src="appConfig.author.avatar" :alt="appConfig.author.name" />
			</div>
			<div class="essay-body">
				<div class="essay-meta">
					<span class="essay-author">{{ appConfig.author.name }}</span>
					<UtilDate class="essay-date" :date="moment.date" />
				</div>
				<div class="essay-content" v-html="moment.content" />
				<div v-if="moment.images?.length" class="essay-images" :class="`count-${moment.images.length}`">
					<UtilImg
						v-for="(img, i) in moment.images"
						:key="i"
						class="essay-image"
						:src="img"
					/>
				</div>
				<div v-if="moment.location" class="essay-location">
					<Icon name="tabler:map-pin" />{{ moment.location }}
				</div>
			</div>
		</li>
	</menu>
</div>
</template>

<style lang="scss" scoped>
.essays-page {
	padding: 1rem;
}

.essays-heading {
	font-size: 1.5em;
	margin-bottom: 1.5rem;
}

.essays-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin: 0;
	padding: 0;
	list-style: none;
}

.essay-item {
	display: flex;
	gap: 0.8rem;
	padding: 1rem;

	.essay-avatar {
		flex-shrink: 0;

		img {
			width: 2.5rem;
			height: 2.5rem;
			border-radius: 50%;
		}
	}

	.essay-body {
		flex-grow: 1;
		overflow: hidden;
	}

	.essay-meta {
		display: flex;
		align-items: baseline;
		gap: 0.5em;

		.essay-author {
			font-weight: 600;
			color: var(--c-text);
		}

		.essay-date {
			font-size: 0.8em;
			color: var(--c-text-3);
		}
	}

	.essay-content {
		margin-top: 0.3em;
		line-height: 1.7;
		color: var(--c-text-1);

		:deep(a) {
			color: var(--c-primary);
		}
	}

	.essay-images {
		display: grid;
		gap: 4px;
		margin-top: 0.6rem;
		grid-template-columns: repeat(3, 1fr);

		&.count-1 {
			grid-template-columns: minmax(0, 60%);
		}

		&.count-2, &.count-4 {
			grid-template-columns: repeat(2, 1fr);
		}

		.essay-image {
			width: 100%;
			aspect-ratio: 1;
			border-radius: 0.4rem;
			object-fit: cover;
		}
	}

	.essay-location {
		display: flex;
		align-items: center;
		gap: 0.2em;
		margin-top: 0.5rem;
		font-size: 0.8em;
		color: var(--c-text-3);
	}
}
</style>
