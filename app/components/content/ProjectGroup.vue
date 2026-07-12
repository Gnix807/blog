<script setup lang="ts">
interface ProjectItem {
	title: string
	desc?: string
	link?: string
	icon?: string
	mirror?: ImgService
}

defineProps<{
	title?: string
	items?: ProjectItem[]
}>()

function isImgIcon(icon?: string) {
	return !!icon && (/^https?:\/\//.test(icon) || icon.startsWith('/'))
}
</script>

<template>
<div class="project-group">
	<h3 v-if="title" class="project-group-title text-creative">
		{{ title }}
	</h3>
	<div class="project-grid">
		<UtilLink
			v-for="(item, index) in items"
			:key="index"
			:to="item.link"
			class="project-card card"
			:title="joinWith([item.title, item.desc, item.link])"
		>
			<UtilImg
				v-if="isImgIcon(item.icon)"
				class="project-icon"
				:src="item.icon!"
				:mirror="item.mirror"
			/>
			<Icon v-else-if="item.icon" class="project-icon" :name="item.icon" />
			<div class="project-info">
				<div class="project-title">
					{{ item.title }}
				</div>
				<div v-if="item.desc" class="project-desc">
					{{ item.desc }}
				</div>
			</div>
		</UtilLink>
	</div>
	<slot />
</div>
</template>

<style lang="scss" scoped>
.project-group {
	article & {
		margin: 2rem 0;
	}
}

.project-group-title {
	margin-bottom: 1rem;
}

.project-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 0.8rem;
}

.project-card {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.8em 1em;
	line-height: 1.4;
	transition: transform 0.2s;

	&:hover {
		transform: translateY(-2px);
	}

	.project-icon {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		object-fit: cover;
		font-size: 2.5rem;
	}

	.project-info {
		overflow: hidden;
	}

	.project-title {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--c-text);
	}

	.project-desc {
		overflow: hidden;
		margin-top: 0.2em;
		font-size: 0.8em;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--c-text-2);
	}
}
</style>
