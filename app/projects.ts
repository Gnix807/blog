export interface ProjectItem {
	/** 项目名称 */
	name: string
	/** 项目描述 */
	description: string
	/** 项目链接 */
	link: string
	/** 图标：Iconify 图标名或图片 URL */
	icon?: string
	/** 技术栈 / 标签 */
	tags?: string[]
	/** 状态，如 '活跃' / '维护中' / '已归档' */
	status?: string
}

export interface ProjectCategory {
	title: string
	items: ProjectItem[]
}

/** 项目展示数据 */
export const projects: ProjectCategory[] = [
	{
		title: '我的项目',
		items: [
			{
				name: '个人博客',
				description: '基于 Nuxt 4 + Nuxt Content 的个人博客',
				link: 'https://github.com/Gnix807/blog',
				icon: 'tabler:notebook',
				tags: ['Nuxt', 'Vue', 'TypeScript'],
				status: '活跃',
			},
		],
	},
	{
		title: '正在使用',
		items: [
			{
				name: 'Nuxt',
				description: 'Vue 全栈框架',
				link: 'https://nuxt.com/',
				icon: 'tabler:brand-nuxt',
				tags: ['框架'],
			},
			{
				name: '1Panel',
				description: '现代化服务器运维管理面板',
				link: 'https://1panel.cn/',
				icon: 'tabler:server-2',
				tags: ['运维'],
			},
		],
	},
]
