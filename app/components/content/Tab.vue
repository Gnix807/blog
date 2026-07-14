<script setup lang="ts">
const props = withDefaults(defineProps<{
	tabs: string[]
	center?: boolean
	active?: string | number
	variant?: 'pill' | 'underline' | 'segment'
}>(), {
	variant: 'pill',
})

const activeTab = ref(Number(props.active) || 1)
</script>

<template>
<div :class="[variant, { center }]">
	<div class="tabs">
		<button
			v-for="(tab, tabIndex) in tabs"
			:key="tabIndex"
			:class="{ active: activeTab === tabIndex + 1 }"
			@click="activeTab = tabIndex + 1"
		>
			{{ tab }}
		</button>
	</div>
	<div v-for="tabIndex in tabs.length" v-show="activeTab === tabIndex" :key="tabIndex" class="tab-content">
		<slot :name="`tab${tabIndex}`" />
	</div>
</div>
</template>

<style lang="scss" scoped>
.float-in-leave-active {
	position: revert !important;
}

.tab-content {
	margin: 1em 0;
}

/* ===== pill (default) ===== */
.pill {
	.center {
		width: fit-content;
		max-width: 100%;
		margin-inline: auto;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5em;
		position: relative;
		width: fit-content;
		margin: 0 auto;
		font-size: 0.9em;
		line-height: 1.4;
	}

	button {
		position: relative;
		margin-bottom: 0.5em;
		padding: 0.3em 0.5em;
		border-radius: 0.4em;
		color: var(--c-text-2);
		transition: all 0.2s;

		&:hover {
			background-color: var(--c-bg-soft);
			color: var(--c-text);
		}

		&::before, &::after {
			display: block;
			position: absolute;
			inset-inline: 0.8em;
			bottom: -0.5em;
			height: 2px;
			border-radius: 1em;
			pointer-events: none;
		}

		&::after {
			content: "";
			inset-inline: -0.8em;
			background-color: var(--c-border);
		}

		&.active {
			box-shadow: var(--box-shadow-1), var(--box-shadow-1);
			background-color: var(--ld-bg-card);
			color: var(--c-text);

			&::before {
				content: "";
				background-color: var(--c-primary);
				z-index: 1;
			}
		}
	}
}

/* ===== underline ===== */
.underline {
	.center {
		width: fit-content;
		max-width: 100%;
		margin-inline: auto;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		border-bottom: 2px solid var(--c-border);
		margin-bottom: 1em;
	}

	button {
		position: relative;
		padding: 0.5em 1em;
		font-size: 0.9em;
		color: var(--c-text-2);
		transition: color 0.2s;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;

		&:hover {
			color: var(--c-text);
		}

		&.active {
			color: var(--c-primary);
			border-bottom-color: var(--c-primary);
			font-weight: 600;
		}
	}
}

/* ===== segment ===== */
.segment {
	.center {
		width: fit-content;
		max-width: 100%;
		margin-inline: auto;
	}

	.tabs {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0;
		padding: 3px;
		border-radius: 0.6em;
		background-color: var(--c-bg-2);
	}

	button {
		padding: 0.4em 1em;
		font-size: 0.88em;
		color: var(--c-text-2);
		border-radius: 0.45em;
		transition: all 0.2s;

		&:hover {
			color: var(--c-text);
		}

		&.active {
			background-color: var(--ld-bg-card);
			color: var(--c-text);
			box-shadow: var(--box-shadow-1);
		}
	}
}
</style>
