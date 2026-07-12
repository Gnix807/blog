import type { FeedEntry } from '~/types/feed'
import { XMLParser } from 'fast-xml-parser'
import feeds from '~/feeds'

interface FcArticle {
	title: string
	created: string
	link: string
	author: string
	avatar?: string
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function asArray<T>(x: T | T[] | undefined): T[] {
	return Array.isArray(x) ? x : x ? [x] : []
}

function text(x: any): string {
	if (x == null)
		return ''
	if (typeof x === 'object')
		return String(x['#text'] ?? '').trim()
	return String(x).trim()
}

function pickLink(link: any): string {
	if (typeof link === 'string')
		return link
	const links = asArray(link)
	const alt = links.find((l: any) => l?.['@_rel'] === 'alternate') ?? links.find((l: any) => l?.['@_href']) ?? links[0]
	return alt?.['@_href'] ?? text(alt)
}

function fmtDate(x: string): string {
	const d = new Date(x)
	return Number.isNaN(d.getTime()) ? x : d.toISOString().slice(0, 10)
}

async function fetchEntry(entry: FeedEntry): Promise<FcArticle[]> {
	if (!entry.feed || entry.error)
		return []
	try {
		const xml = await $fetch<string>(entry.feed, {
			responseType: 'text',
			timeout: 15000,
			retry: 1,
			headers: { 'User-Agent': 'Mozilla/5.0 FriendCircle' },
		})
		const obj = parser.parse(xml)
		let items: any[] = []
		if (obj?.feed?.entry) // Atom
			items = asArray(obj.feed.entry).map(it => ({
				title: text(it.title),
				link: pickLink(it.link),
				created: text(it.updated) || text(it.published),
			}))
		else if (obj?.rss?.channel?.item) // RSS 2.0
			items = asArray(obj.rss.channel.item).map(it => ({
				title: text(it.title),
				link: pickLink(it.link),
				created: text(it.pubDate),
			}))
		else if (obj?.['rdf:RDF']?.item) // RSS 1.0
			items = asArray(obj['rdf:RDF'].item).map(it => ({
				title: text(it.title),
				link: pickLink(it.link),
				created: text(it['dc:date']),
			}))

		return items
			.filter(it => it.title && it.link)
			.slice(0, 5)
			.map(it => ({
				title: it.title,
				link: it.link,
				created: fmtDate(it.created),
				author: entry.title || entry.sitenick || entry.author,
				avatar: entry.avatar,
			}))
	}
	catch {
		return []
	}
}

export default defineEventHandler(async () => {
	const entries = feeds.flatMap(g => g.entries).filter(e => e.feed && !e.error)
	const results = await Promise.all(entries.map(fetchEntry))
	const articles = results.flat()

	articles.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

	return {
		statistical_data: {
			friends_num: entries.length,
			active_num: results.filter(r => r.length).length,
			article_num: articles.length,
			last_updated_time: new Date().toISOString().slice(0, 16).replace('T', ' '),
		},
		article_data: articles.slice(0, 60),
	}
})
