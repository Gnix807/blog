<script setup lang="ts">
const appConfig = useAppConfig()

interface TwikooComment {
	id: string
	nick: string
	avatar?: string
	comment: string
	url: string
	created: number
}

const comments = ref<TwikooComment[]>([])
const loading = ref(true)

function stripHtml(html: string) {
	return html.replace(/<[^>]+>/g, '').trim()
}

onMounted(async () => {
	const envId = appConfig.twikoo?.envId
	if (!envId)
		return
	try {
		const res = await $fetch<{ data?: TwikooComment[] }>(envId, {
			method: 'POST',
			body: {
				event: 'GET_RECENT_COMMENTS',
				includeReply: false,
				pageSize: 5,
			},
		})
		comments.value = res.data ?? []
	}
	catch {
		comments.value = []
	}
	finally {
		loading.value = false
	}
})
</script>

<template>
<BlogWidget v-if="appConfig.twikoo?.envId" card title="最新评论">
	<div v-if="loading" class="comments-loading">
		加载中……
	</div>
	<menu v-else-if="comments.length" class="comments">
		<li v-for="item in comments" :key="item.id">
			<UtilLink :to="item.url" class="comment">
				<UtilImg v-if="item.avatar" class="comment-avatar" :src="item.avatar" />
				<div class="comment-body">
					<div class="comment-nick">
						{{ item.nick }}
					</div>
					<div class="comment-text">
						{{ stripHtml(item.comment) }}
					</div>
				</div>
			</UtilLink>
		</li>
	</menu>
	<div v-else class="comments-loading">
		暂无评论
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.comments {
	margin: 0;
	padding: 0;
	list-style: none;

	> li {
		margin: 0;

		& + li {
			border-top: 1px solid var(--c-border);
		}
	}
}

.comment {
	display: flex;
	gap: 0.5rem;
	padding: 0.5em 0;

	.comment-avatar {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}

	.comment-body {
		overflow: hidden;
		font-size: 0.85em;
	}

	.comment-nick {
		color: var(--c-text-2);
	}

	.comment-text {
		display: -webkit-box;
		overflow: hidden;
		margin-top: 0.2em;
		line-height: 1.4;
		color: var(--c-text);
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
}

.comments-loading {
	font-size: 0.9em;
	text-align: center;
	color: var(--c-text-3);
}
</style>
