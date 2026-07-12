<script setup lang="ts">
import { projects } from '~/projects'

const appConfig = useAppConfig()
useSeoMeta({
	title: '项目',
	description: `${appConfig.author.name}的项目与常用工具展示。`,
})

function isImgIcon(icon?: string) {
	return !!icon && (/^https?:\/\//.test(icon) || icon.startsWith('/'))
}
</script>

<template>
<template #aside>
	<WidgetGithubCard />
	<WidgetBlogStats />
</template>

<div class="projects-page">
	<h1 class="projects-heading text-creative">
		项目
	</h1>

	<section v-for="category in projects" :key="category.title" class="project-category">
		<h2 class="category-title text-creative">
			{{ category.title }}
		</h2>
		<div class="project-grid">
			<UtilLink
				v-for="item in category.items"
				:key="item.name"
				:to="item.link"
				class="project-card card"
				:title="joinWith([item.name, item.description, item.link])"
			>
				<div class="project-head">
					<UtilImg v-if="isImgIcon(item.icon)" class="project-icon" :src="item.icon!" />
					<Icon v-else-if="item.icon" class="project-icon" :name="item.icon" />
					<div class="project-name">
						{{ item.name }}
					</div>
					<span v-if="item.status" class="project-status">{{ item.status }}</span>
				</div>
				<p class="project-desc">
					{{ item.description }}
				</p>
				<div v-if="item.tags?.length" class="project-tags">
					<span v-for="tag in item.tags" :key="tag" class="project-tag">{{ tag }}</span>
				</div>
			</UtilLink>
		</div>
	</section>
</div>
</template>

<style lang="scss" scoped>
.projects-page {
	padding: 1rem;
}

.projects-heading {
	font-size: 1.5em;
	margin-bottom: 1rem;
}

.project-category {
	margin-bottom: 2rem;

	.category-title {
		margin-bottom: 1rem;
		font-size: 1.1em;
		color: var(--c-text-2);
	}
}

.project-grid {
	display: grid;
	gap: 0.8rem;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.project-card {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
	transition: transform 0.2s;

	&:hover {
		transform: translateY(-3px);
	}

	.project-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.project-icon {
			width: 1.8rem;
			height: 1.8rem;
			border-radius: 0.4rem;
			object-fit: cover;
			font-size: 1.8rem;
			color: var(--c-primary);
		}

		.project-name {
			flex-grow: 1;
			font-weight: 600;
			color: var(--c-text);
		}

		.project-status {
			padding: 0.1em 0.5em;
			border-radius: 1em;
			background-color: var(--c-primary-soft);
			font-size: 0.7em;
			color: var(--c-primary);
		}
	}

	.project-desc {
		margin: 0;
		font-size: 0.85em;
		line-height: 1.5;
		color: var(--c-text-2);
	}

	.project-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;

		.project-tag {
			padding: 0.1em 0.5em;
			border-radius: 0.4em;
			background-color: var(--c-bg-2);
			font-size: 0.72em;
			color: var(--c-text-3);
		}
	}
}
</style>
