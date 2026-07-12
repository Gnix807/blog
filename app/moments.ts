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
		content: '冰山图宇宙现已正式上线！',
		images: [
			'https://raw.githubusercontent.com/Gnix807/icebergs-1.0/main/public/screenshots/homepage.png',
		],
		tags: ['冰山图宇宙', '上线'],
		createdAt: '2026-07-12 18:00',
	},
]
