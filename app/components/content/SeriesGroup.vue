<script setup lang="ts">
defineProps<{
	title: string
	desc?: string
	covers?: string[]
	count?: string
	link?: string
	linkText?: string
	mirror?: ImgService
}>()
</script>

<template>
<div class="series-group card">
	<div v-if="covers?.length" class="series-covers">
		<UtilImg
			v-for="(cover, index) in covers"
			:key="index"
			class="series-cover"
			:src="cover"
			:mirror
		/>
	</div>
	<div class="series-info">
		<h3 class="series-title text-creative">
			{{ title }}
		</h3>
		<p v-if="desc" class="series-desc">
			{{ desc }}
		</p>
		<div class="series-footer">
			<span v-if="count" class="series-count">{{ count }}</span>
			<UtilLink v-if="link" :to="link" class="series-link">
				{{ linkText ?? '查看详情' }}
				<Icon name="tabler:arrow-right" />
			</UtilLink>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.series-group {
	overflow: hidden;

	article & {
		max-width: $breakpoint-phone;
		margin: 2rem auto;
	}
}

.series-covers {
	display: flex;
	gap: 2px;

	.series-cover {
		flex: 1;
		width: 0;
		aspect-ratio: 2;
		object-fit: cover;
	}
}

.series-info {
	padding: 0.8em 1em;
}

.series-title {
	margin: 0;
	font-size: 1.2em;
	color: var(--c-text);
}

.series-desc {
	margin: 0.5em 0;
	font-size: 0.9em;
	color: var(--c-text-2);
}

.series-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 0.5em;
	font-size: 0.85em;
	color: var(--c-text-3);

	.series-link {
		display: inline-flex;
		align-items: center;
		gap: 0.2em;
		color: var(--c-primary);
		transition: gap 0.2s;

		&:hover {
			gap: 0.4em;
		}
	}
}
</style>
