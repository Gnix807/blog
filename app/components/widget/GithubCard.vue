<script setup lang="ts">
const appConfig = useAppConfig()

interface GithubUser {
	login: string
	name: string
	avatar_url: string
	bio: string
	html_url: string
	public_repos: number
	followers: number
	following: number
}

const user = ref<GithubUser | null>(null)
const username = computed(() => appConfig.githubUsername)

onMounted(async () => {
	if (!username.value)
		return
	try {
		user.value = await $fetch<GithubUser>(`https://api.github.com/users/${username.value}`)
	}
	catch {
		user.value = null
	}
})

const stats = computed(() => user.value
	? [
			{ label: '仓库', value: user.value.public_repos },
			{ label: '关注者', value: user.value.followers },
			{ label: '关注中', value: user.value.following },
		]
	: [])
</script>

<template>
<BlogWidget v-if="username" card title="GitHub">
	<UtilLink v-if="user" :to="user.html_url" class="github-card">
		<UtilImg class="github-avatar" :src="user.avatar_url" />
		<div class="github-name">
			{{ user.name || user.login }}
		</div>
		<div v-if="user.bio" class="github-bio">
			{{ user.bio }}
		</div>
		<div class="github-stats">
			<div v-for="stat in stats" :key="stat.label" class="github-stat">
				<span class="github-stat-value">{{ stat.value }}</span>
				<span class="github-stat-label">{{ stat.label }}</span>
			</div>
		</div>
	</UtilLink>
	<div v-else class="github-loading">
		加载中……
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.github-card {
	display: block;
	text-align: center;

	.github-avatar {
		width: 4rem;
		height: 4rem;
		margin: 0 auto 0.5rem;
		border-radius: 50%;
	}

	.github-name {
		font-size: 1.1em;
		color: var(--c-text);
	}

	.github-bio {
		margin-top: 0.3em;
		font-size: 0.85em;
		color: var(--c-text-2);
	}

	.github-stats {
		display: flex;
		justify-content: space-around;
		margin-top: 0.8rem;
	}

	.github-stat {
		display: flex;
		flex-direction: column;

		.github-stat-value {
			font-size: 1.1em;
			font-weight: 700;
			color: var(--c-text);
		}

		.github-stat-label {
			font-size: 0.75em;
			color: var(--c-text-3);
		}
	}
}

.github-loading {
	font-size: 0.9em;
	text-align: center;
	color: var(--c-text-3);
}
</style>
