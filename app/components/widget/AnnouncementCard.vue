<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
<BlogWidget v-if="appConfig.announcement" card title="公告">
	<div class="announcement">
		<Icon class="announcement-icon" name="tabler:speakerphone" />
		<p class="announcement-text" v-html="appConfig.announcement" />
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.announcement {
	display: flex;
	gap: 0.5rem;
	font-size: 0.9em;
	line-height: 1.6;
	color: var(--c-text-2);

	.announcement-icon {
		flex-shrink: 0;
		margin-top: 0.2em;
		font-size: 1.2em;
		color: var(--c-primary);
	}

	.announcement-text {
		margin: 0;

		:deep(a) {
			color: var(--c-primary);
		}
	}
}
</style>
