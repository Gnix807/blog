<script setup lang="ts">
import type { ProjectRelation } from '~/projects'
import { projects, relationLabels } from '~/projects'

const appConfig = useAppConfig()
useSeoMeta({
	title: '项目',
	description: `${appConfig.author.name}参与、创建与设计的项目作品。`,
})

const relation = ref<ProjectRelation | 'all'>('all')
const view = ref<'gallery' | 'list'>('gallery')

const tabs = computed(() => [
	{ key: 'all' as const, label: '全部' },
	...(Object.keys(relationLabels) as ProjectRelation[]).map(key => ({ key, label: relationLabels[key] })),
])

const filtered = computed(() => relation.value === 'all'
	? projects
	: projects.filter(p => p.relation === relation.value),
)

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
	<div class="projects-toolbar">
		<div class="project-tabs">
			<button
				v-for="tab in tabs"
				:key="tab.key"
				class="project-tab"
				:class="{ active: relation === tab.key }"
				@click="relation = tab.key"
			>
				{{ tab.label }}
			</button>
		</div>
		<div class="view-toggle">
			<button :class="{ active: view === 'gallery' }" aria-label="画廊" @click="view = 'gallery'">
				<Icon name="tabler:layout-grid" />
			</button>
			<button :class="{ active: view === 'list' }" aria-label="列表" @click="view = 'list'">
				<Icon name="tabler:list" />
			</button>
		</div>
	</div>

	<TransitionGroup tag="div" class="project-container" :class="`view-${view}`" name="float-in">
		<UtilLink
			v-for="item in filtered"
			:key="item.name"
			:to="item.link"
			class="project-card card"
			:title="joinWith([item.name, item.description, item.link])"
		>
			<div class="project-head">
				<UtilImg v-if="isImgIcon(item.icon)" class="project-icon" :src="item.icon!" />
				<Icon v-else-if="item.icon" class="project-icon" :name="item.icon" />
				<h3 class="project-name">
					{{ item.name }}
				</h3>
			</div>
			<div class="project-badges">
				<span v-if="item.type" class="badge type">{{ item.type }}</span>
				<span class="badge relation">{{ relationLabels[item.relation] }}</span>
			</div>
			<p class="project-desc">
				{{ item.description }}
			</p>
		</UtilLink>
	</TransitionGroup>
</div>
</template>

<style lang="scss" scoped>
.projects-page {
	padding: 1rem;
}

.projects-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem 1rem;
	margin-bottom: 1.2rem;
}

.project-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 0.3rem;

	.project-tab {
		padding: 0.3em 0.8em;
		border-radius: 1em;
		font-size: 0.85em;
		color: var(--c-text-2);
		transition: all 0.2s;

		&:hover {
			background-color: var(--c-bg-soft);
			color: var(--c-text);
		}

		&.active {
			background-color: var(--c-primary-soft);
			color: var(--c-primary);
		}
	}
}

.view-toggle {
	display: flex;
	gap: 2px;
	padding: 2px;
	border: 1px solid var(--c-border);
	border-radius: 0.5em;

	button {
		display: flex;
		padding: 0.3em 0.6em;
		border-radius: 0.4em;
		color: var(--c-text-3);
		transition: all 0.2s;

		&:hover {
			color: var(--c-text);
		}

		&.active {
			background-color: var(--c-bg-soft);
			color: var(--c-primary);
		}
	}
}

.project-container {
	&.view-gallery {
		display: grid;
		gap: 0.8rem;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}

	&.view-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
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
			width: 1.6rem;
			height: 1.6rem;
			border-radius: 0.4rem;
			object-fit: cover;
			font-size: 1.6rem;
			color: var(--c-primary);
		}

		.project-name {
			margin: 0;
			font-size: 1.05em;
			color: var(--c-text);
		}
	}

	.project-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;

		.badge {
			padding: 0.1em 0.5em;
			border-radius: 0.4em;
			font-size: 0.72em;

			&.type {
				background-color: var(--c-bg-2);
				color: var(--c-text-2);
			}

			&.relation {
				background-color: var(--c-primary-soft);
				color: var(--c-primary);
			}
		}
	}

	.project-desc {
		margin: 0;
		font-size: 0.85em;
		line-height: 1.5;
		color: var(--c-text-2);
	}
}

// 列表视图下横向紧凑排布
.view-list .project-card {
	display: grid;
	align-items: center;
	gap: 0.3rem 1rem;
	grid-template-columns: auto 1fr;

	.project-head {
		grid-column: 1;
	}

	.project-badges {
		grid-column: 2;
		grid-row: 1;
		justify-content: flex-end;
	}

	.project-desc {
		grid-column: 1 / -1;
	}

	&:hover {
		transform: none;
		background-color: var(--c-bg-soft);
	}
}
</style>
