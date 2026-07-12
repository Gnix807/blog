export interface Moment {
	/** 发布时间，如 '2026-07-12 10:00' */
	date: string
	/** 正文内容，支持简单 HTML */
	content: string
	/** 配图，可选 */
	images?: string[]
	/** 位置，可选 */
	location?: string
}

/** 即刻/说说数据，按时间倒序展示 */
export const moments: Moment[] = [
	{
		date: '2026-07-12 10:00',
		content: '「即刻」页面上线啦，以后随手记录一些碎碎念～',
	},
]
