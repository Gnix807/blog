interface BiliItem {
	season_id: number
	media_id: number
	title: string
	cover: string
	evaluate?: string
	follow_status: number
	total_count?: number
	new_ep?: { index_show?: string }
	badge?: string
}

const PAGE_SIZE = 30
const MAX_PAGES = 40

export default defineEventHandler(async (event) => {
	const rc = useRuntimeConfig(event)
	const uid = rc.public?.biliUid
	const proxy = rc.public?.biliApi

	if (!uid && !proxy)
		return { list: [] as BiliItem[], configured: false, failed: false }

	function buildUrl(pn: number) {
		if (proxy)
			return `${proxy}${proxy.includes('?') ? '&' : '?'}pn=${pn}&ps=${PAGE_SIZE}`
		return `https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=0&vmid=${uid}&ps=${PAGE_SIZE}&pn=${pn}`
	}

	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
		'Referer': 'https://www.bilibili.com',
	}

	try {
		const collected: BiliItem[] = []
		let total = Infinity
		for (let pn = 1; pn <= MAX_PAGES && collected.length < total; pn++) {
			const res = await $fetch<{ code: number, data?: { list?: BiliItem[], total?: number } }>(buildUrl(pn), { headers, retry: 2, retryDelay: 1000, timeout: 30000 })
			if (res.code !== 0)
				return { list: collected, configured: true, failed: pn === 1 }
			const pageList = res.data?.list ?? []
			total = res.data?.total ?? pageList.length
			collected.push(...pageList)
			if (!pageList.length)
				break
		}
		return { list: collected, configured: true, failed: false }
	}
	catch {
		return { list: [] as BiliItem[], configured: true, failed: true }
	}
})
