<script setup lang="ts">
import { orderBy } from 'es-toolkit/array'

const appConfig = useAppConfig()
useSeoMeta({
	title: '游戏',
	description: `${appConfig.author.name}的 Steam 游戏库与游玩时长。`,
})

interface SteamGame {
	appid: number
	name: string
	playtimeForever: number
	playtime2Weeks?: number
	headerImage?: string
}

const sort = ref<'total' | 'recent'>('total')

// 兼容多种返回格式：
// - Steam 官方 GetOwnedGames：{ response: { games: [{ appid, name, playtime_forever, playtime_2weeks }] } }
// - Halo Steam 插件 /games：{ items: [{ appId, name, playtimeForever, headerImageUrl, playtime2Weeks }] }
function normalize(raw: any): SteamGame[] {
	const arr = raw?.items ?? raw?.response?.games ?? raw?.games ?? raw?.data ?? []
	return arr.map((g: any) => ({
		appid: g.appId ?? g.appid,
		name: g.name,
		playtimeForever: g.playtimeForever ?? g.playtime_forever ?? 0,
		playtime2Weeks: g.playtime2Weeks ?? g.playtime_2weeks,
		headerImage: g.headerImageUrl ?? g.realHeaderImage ?? undefined,
	}))
}

// 构建时（prerender）在 Node 中抓取，避免浏览器 CORS；API Key 仅存于服务器环境变量，不写入静态产物
const { data } = await useAsyncData('steam-games', async () => {
	const rc = useRuntimeConfig()
	const key = rc.steam?.apiKey
	const steamid = rc.steam?.id
	try {
		let raw: any
		if (appConfig.steamApi) {
			raw = await $fetch(appConfig.steamApi)
		}
		else if (key && steamid) {
			raw = await $fetch('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
				params: {
					key,
					steamid,
					include_appinfo: 1,
					include_played_free_games: 1,
					format: 'json',
				},
			})
		}
		else {
			return { games: [] as SteamGame[], configured: false, failed: false }
		}
		return { games: normalize(raw), configured: true, failed: false }
	}
	catch {
		return { games: [] as SteamGame[], configured: true, failed: true }
	}
}, { default: () => ({ games: [] as SteamGame[], configured: false, failed: false }) })

const games = computed(() => data.value?.games ?? [])
const configured = computed(() => data.value?.configured)
const failed = computed(() => data.value?.failed)

const totalHours = computed(() =>
	Math.round(games.value.reduce((sum, g) => sum + (g.playtimeForever ?? 0), 0) / 60),
)

const sortedGames = computed(() => sort.value === 'recent'
	? orderBy(games.value.filter(g => g.playtime2Weeks), ['playtime2Weeks'], ['desc'])
	: orderBy(games.value, ['playtimeForever'], ['desc']),
)

function hours(minutes?: number) {
	return ((minutes ?? 0) / 60).toFixed(1)
}

function capsule(game: SteamGame) {
	return game.headerImage || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
}
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetBlogLog />
</template>

<div class="game-page">
	<h1 class="game-heading text-creative">
		游戏
	</h1>

	<!-- 未配置 Steam 数据源 -->
	<div v-if="!configured" class="game-hint card">
		<Icon name="tabler:brand-steam" />
		<p>
			展示 Steam 游戏库需要在构建环境提供 Steam Web API Key 与 SteamID64（写入服务器环境变量 <code>NUXT_STEAM_API_KEY</code> / <code>NUXT_STEAM_ID</code>，不会写入代码）。
			也可改用后端代理：把接口地址填入 <code>app.config.ts</code> 的 <code>steamApi</code>（如
			<a href="https://github.com/Tim0x0/halo-plugin-steam" target="_blank" rel="noopener">halo-plugin-steam</a> 插件接口）。
		</p>
	</div>

	<div v-else-if="failed" class="game-hint card">
		Steam 数据获取失败，请检查 API Key / SteamID 是否正确、资料是否公开。
	</div>

	<template v-else>
		<div class="game-toolbar">
			<div class="game-tabs">
				<ZButton text="全部" :primary="sort === 'total'" @click="sort = 'total'" />
				<ZButton text="最近游玩" :primary="sort === 'recent'" @click="sort = 'recent'" />
			</div>
			<div class="game-stats">
				<span><b>{{ games.length }}</b> 款游戏</span>
				<span><b>{{ totalHours }}</b> 小时</span>
				<UtilLink v-if="appConfig.steamProfile" :to="appConfig.steamProfile" class="steam-link">
					<Icon name="tabler:brand-steam" />主页
				</UtilLink>
			</div>
		</div>

		<TransitionGroup name="float-in" tag="div" class="game-list">
			<UtilLink
				v-for="game in sortedGames"
				:key="game.appid"
				:to="`https://store.steampowered.com/app/${game.appid}`"
				class="game-card card"
				:title="game.name"
			>
				<UtilImg class="game-cover" :src="capsule(game)" :alt="game.name" />
				<div class="game-info">
					<div class="game-name">
						{{ game.name }}
					</div>
					<div class="game-time">
						<span><Icon name="tabler:clock" />{{ hours(game.playtimeForever) }} h</span>
						<span v-if="game.playtime2Weeks" class="recent">
							近两周 {{ hours(game.playtime2Weeks) }} h
						</span>
					</div>
				</div>
			</UtilLink>
		</TransitionGroup>
	</template>
</div>
</template>

<style lang="scss" scoped>
.game-page {
	padding: 1rem;
}

.game-heading {
	font-size: 1.5em;
	margin-bottom: 1rem;
}

.game-hint {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	padding: 1rem;
	font-size: 0.9em;
	line-height: 1.6;
	color: var(--c-text-2);

	> .iconify {
		flex-shrink: 0;
		margin-top: 0.2em;
		font-size: 1.3em;
	}

	code {
		padding: 0.1em 0.3em;
		border-radius: 0.3em;
		background-color: var(--c-bg-2);
	}

	a {
		color: var(--c-primary);
	}
}

.game-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem 1rem;
	margin-bottom: 1rem;

	.game-tabs {
		display: flex;
		gap: 0.5rem;
	}

	.game-stats {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.85em;
		color: var(--c-text-2);

		b {
			color: var(--c-primary);
		}

		.steam-link {
			display: inline-flex;
			align-items: center;
			gap: 0.2em;
		}
	}
}

.game-list {
	display: grid;
	gap: 0.8rem;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.game-card {
	display: flex;
	overflow: hidden;
	padding: 0;
	transition: transform 0.2s;

	&:hover {
		transform: translateY(-3px);
	}

	.game-cover {
		flex-shrink: 0;
		width: 40%;
		object-fit: cover;
	}

	.game-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.6rem 0.8rem;
		overflow: hidden;
	}

	.game-name {
		font-weight: 600;
		color: var(--c-text);
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.game-time {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.8rem;
		font-size: 0.8em;
		color: var(--c-text-2);

		span {
			display: inline-flex;
			align-items: center;
			gap: 0.2em;
		}

		.recent {
			color: var(--c-primary);
		}
	}
}
</style>
