<script setup lang="ts">
interface Props {
	/** 系列标题 */
	title: string
	/** 系列描述 */
	description?: string
	/** 系列封面图，支持单张或多张 */
	cover?: string | string[]
	/** 系列详情链接 */
	link?: string
	/** 作品数量 */
	count?: number
	/** 是否在新标签页打开 */
	openInNewTab?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	openInNewTab: true,
})

// 规范化封面图为数组
const covers = computed(() => {
	if (!props.cover)
		return []
	return Array.isArray(props.cover) ? props.cover : [props.cover]
})

const isExpanded = ref(false)
function toggleExpand() {
	isExpanded.value = !isExpanded.value
}
</script>

<template>
<div class="series-group" :class="{ expanded: isExpanded }">
	<!-- 封面区域 -->
	<div class="cover-section">
		<div class="cover-container">
			<div class="cover-stack">
				<div
					v-for="(coverItem, index) in covers"
					:key="`${coverItem}-${index}`"
					class="stack-item"
					:style="{ 'zIndex': covers.length - index, '--i': index }"
				>
					<UtilImg :src="coverItem" :alt="title" class="cover-image" />
				</div>
			</div>
		</div>
	</div>

	<!-- 信息区域 -->
	<div class="info-section">
		<div class="info-content">
			<h2 class="series-title">
				{{ title }}
			</h2>
			<p v-if="description" class="series-description">
				{{ description }}
			</p>
		</div>

		<div class="meta-actions">
			<div v-if="count" class="series-count">
				<Icon name="tabler:device-gamepad-2" />
				<span>共 {{ count }} 部 Galgame</span>
			</div>

			<div class="action-area">
				<button
					v-if="covers.length > 1"
					class="expand-btn"
					:title="isExpanded ? '收起' : '展开'"
					@click="toggleExpand"
				>
					<Icon :name="isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'" />
				</button>

				<UtilLink
					v-if="link"
					:to="link"
					class="detail-link"
					title="查看详情"
				>
					<Icon name="tabler:arrow-right" />
					<span>查看详情</span>
				</UtilLink>
			</div>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.series-group {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border: 1px solid var(--c-border);
	border-radius: 0.5rem;
	background-color: transparent;
	transition: all 0.2s ease;

	article & {
		max-width: $breakpoint-phone;
		margin: 2rem auto;
	}
}

.cover-section {
	flex-shrink: 0;
	position: relative;
	width: 100%;
}

.cover-container {
	position: relative;
	width: 100%;
	aspect-ratio: 16 / 6;
	background-color: var(--c-bg-3);
	cursor: pointer;
}

.cover-stack {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	position: relative;
	width: 100%;
	height: 100%;
	padding-left: 2rem;
}

.stack-item {
	position: absolute;
	overflow: hidden;
	top: 50%;
	width: auto;
	height: 80%;
	aspect-ratio: 16 / 9;
	border-radius: 0.3rem;
	box-shadow: var(--box-shadow-2);
	transform: translateY(-50%) translateX(calc(var(--i, 0) * 60px));
	transition: transform 0.5s ease-out;
}

.cover-stack:hover .stack-item,
.series-group.expanded .stack-item {
	transform: translateY(-50%) translateX(calc(var(--i, 0) * 50%));
}

.cover-image {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.info-section {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
}

.info-content {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 0.4rem;
	min-width: 0;
}

.series-title {
	margin: 0;
	font-size: 1rem;
	font-weight: 700;
	line-height: 1.2;
	word-break: break-word;
	color: var(--c-text);
}

.series-description {
	display: -webkit-box;
	overflow: hidden;
	margin: 0;
	font-size: 0.8rem;
	-webkit-line-clamp: 1;
	line-clamp: 1;
	line-height: 1.4;
	word-break: break-word;
	color: var(--c-text-2);
	-webkit-box-orient: vertical;
}

.meta-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.series-count {
	display: flex;
	align-items: center;
	gap: 0.3rem;
	font-size: 0.75rem;
	color: var(--c-text-2);

	:deep(svg) {
		opacity: 0.7;
		width: 0.9em;
		height: 0.9em;
	}
}

.action-area {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: flex-end;
	gap: 0.5rem;
}

.expand-btn {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	padding: 0;
	border: 1px solid var(--c-border);
	border-radius: 0.3rem;
	background-color: var(--c-bg-soft);
	color: var(--c-text-2);
	transition: all 0.2s ease;
	cursor: pointer;

	&:hover {
		border-color: var(--c-primary);
		background-color: var(--c-bg-3);
		color: var(--c-text);
	}

	:deep(svg) {
		width: 1.2rem;
		height: 1.2rem;
	}
}

.detail-link {
	display: inline-flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	gap: 0.25rem;
	padding: 0.5rem 1rem;
	font-size: 0.8rem;
	text-decoration: none;
	color: var(--c-text-2);
	transition: color 0.2s ease;

	&:hover {
		color: var(--c-text);
	}

	:deep(svg) {
		width: 1em;
		height: 1em;
	}
}

@media (max-width: 640px) {
	.cover-container {
		aspect-ratio: 8 / 2.5;
	}

	.info-section {
		gap: 0.75rem;
		padding: 0.75rem;
	}

	.series-title {
		font-size: 0.95rem;
	}

	.action-area {
		flex-wrap: wrap;
	}

	.detail-link {
		flex: 1;
		min-width: 120px;
	}
}
</style>
