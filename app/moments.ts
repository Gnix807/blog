export interface MomentItem {
	/** 正文，支持 [文本](链接) 与换行 */
	content: string
	/** 配图，支持 1-9 张，点击可放大 */
	images?: string[]
	/** 位置 */
	location?: string
	/** 标签 */
	tags?: string[]
	/** 发布时间，如 '2026-07-12 10:00' */
	createdAt: string
}

/** 即刻/说说数据（展示时按时间倒序） */
export const moments: MomentItem[] = [
	{
		content: '「即刻」页面上线啦，以后随手记录一些碎碎念～欢迎来 [友链页](/link) 串门。',
		location: '西安',
		tags: ['博客'],
		createdAt: '2026-07-12 10:00',
	},
	{
		content: '测试一下多图九宫格效果。',
		images: [
			'https://picsum.photos/400/400?a',
			'https://picsum.photos/400/400?b',
			'https://picsum.photos/400/400?c',
		],
		location: '西安',
		tags: ['日常'],
		createdAt: '2026-07-11 21:00',
	},
]
