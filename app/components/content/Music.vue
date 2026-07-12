<script setup lang="ts">
defineProps<{
	link: string
	title: string
	artist?: string
	cover?: string
	mirror?: ImgService
}>()
</script>

<template>
<UtilLink :to="link" class="music card" :title="joinWith([title, artist, link])">
	<UtilImg v-if="cover" class="music-cover" :src="cover" :mirror />
	<div v-else class="music-cover music-cover-fallback">
		<Icon name="tabler:music" />
	</div>
	<div class="music-info">
		<div class="music-title">
			{{ title }}
		</div>
		<div class="music-artist">
			{{ artist ?? getDomain(link) }}
		</div>
	</div>
	<Icon class="music-play" name="tabler:player-play-filled" />
</UtilLink>
</template>

<style lang="scss" scoped>
.music {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.5em 0.8em;
	line-height: 1.4;

	article & {
		width: 24rem;
		max-width: 90%;
		margin: 2rem auto;
	}

	.music-cover {
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		border-radius: 0.5rem;
		object-fit: cover;
	}

	.music-cover-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--c-bg-2);
		color: var(--c-text-2);
		font-size: 1.5em;
	}

	.music-info {
		flex-grow: 1;
		overflow: hidden;
	}

	.music-title {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--c-text);
	}

	.music-artist {
		overflow: hidden;
		margin-top: 0.2em;
		font-size: 0.8em;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--c-text-2);
	}

	.music-play {
		flex-shrink: 0;
		font-size: 1.2em;
		color: var(--c-text-3);
		transition: color 0.2s;
	}

	&:hover .music-play {
		color: var(--c-primary);
	}
}
</style>
