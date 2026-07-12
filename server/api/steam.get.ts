interface SteamGame {
	appid: number
	name: string
	playtimeForever: number
	playtime2Weeks?: number
	headerImage?: string
}

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

export default defineEventHandler(async (event) => {
	const rc = useRuntimeConfig(event)
	const key = rc.steam?.apiKey
	const steamid = rc.steam?.id
	const proxy = rc.public?.steamApi

	try {
		let raw: any
		if (proxy) {
			raw = await $fetch(proxy)
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
				retry: 2,
				retryDelay: 1000,
				timeout: 30000,
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
})
