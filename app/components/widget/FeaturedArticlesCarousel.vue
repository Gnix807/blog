<script setup lang="ts">
import Autoplay from 'embla-carousel-autoplay'
import emblaCarouselVue from 'embla-carousel-vue'

const { data: listRaw } = await useAsyncData('posts:index', () => getArticleIndexOptions(), { default: () => [] })

const featured = computed(() =>
	listRaw.value
		.filter(item => item.recommend != null && item.image)
		.sort((a, b) => (b.recommend ?? 0) - (a.recommend ?? 0))
		.slice(0, 8),
)

const [carouselEl] = emblaCarouselVue({ loop: true, align: 'center' }, [
	Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true }),
])
</script>

<template>
<BlogWidget v-if="featured.length" card title="精选文章">
	<div ref="carouselEl" class="featured-carousel">
		<div class="featured-list">
			<UtilLink
				v-for="article in featured"
				:key="article.path"
				class="featured-item"
				:to="article.path"
				:title="article.title"
			>
				<UtilImg class="featured-cover" :src="article.image!" :alt="article.title" />
				<div class="featured-title text-creative">
					{{ article.title }}
				</div>
			</UtilLink>
		</div>
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.featured-carousel {
	overflow: hidden;
	border-radius: 0.5rem;
	cursor: grab;
	user-select: none;

	.featured-list {
		display: flex;
	}
}

.featured-item {
	contain: paint;
	flex-shrink: 0;
	position: relative;
	width: 100%;
	aspect-ratio: 1.9;

	.featured-cover {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.featured-title {
		position: absolute;
		bottom: 0;
		width: 100%;
		padding: 1.5em 0.6em 0.5em;
		background-image: linear-gradient(transparent, #0006);
		font-size: 0.85em;
		text-shadow: var(--text-shadow-black);
		color: white;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>
