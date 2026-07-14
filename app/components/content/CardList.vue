<script setup lang="ts">
withDefaults(defineProps<{
	variant?: 'default' | 'compact' | 'bordered'
	columns?: number
}>(), {
	variant: 'default',
	columns: 3,
})
</script>

<template>
<div class="card-list" :class="`variant-${variant}`" :style="{ '--card-columns': columns }">
	<slot />
</div>
</template>

<style lang="scss" scoped>
:deep() {
	:where(ol, ul):not([class]) {
		margin: 0;
		padding-inline-start: 0;
		list-style: none;

		> li {
			margin: 0;
		}
	}

	> ol, > ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(calc(240px * 3 / var(--card-columns, 3)), 1fr));
		gap: 0.5em;

		> li {
			border-radius: 0.5em;
			background-color: var(--ld-bg-card);
			box-shadow: var(--box-shadow-2);
			transition: transform 0.15s ease, box-shadow 0.15s ease;
		}
	}
}

.variant-default :deep(> ol > li), .variant-default :deep(> ul > li) {
	padding: 0.6em 0.9em;

	&:hover {
		transform: translateY(-2px);
		box-shadow: var(--box-shadow-3);
	}
}

.variant-compact :deep(> ol > li), .variant-compact :deep(> ul > li) {
	padding: 0.35em 0.6em;
	font-size: 0.92em;
	box-shadow: none;
	border: 1px solid var(--c-border);
}

.variant-bordered :deep(> ol > li), .variant-bordered :deep(> ul > li) {
	padding: 0.6em 0.9em;
	box-shadow: none;
	border: 1px solid var(--c-border);

	&:hover {
		border-color: var(--c-primary);
		box-shadow: var(--box-shadow-1);
	}
}
</style>
