export type ProjectRelation = 'created' | 'participation' | 'design' | 'using'

export interface ProjectItem {
	/** 项目名称 */
	name: string
	/** 项目描述 */
	description: string
	/** 项目链接 */
	link: string
	/** 类型标签，如 project / website / vscode-extend */
	type?: string
	/** 与我的关系：创建 / 参与 / 设计 */
	relation: ProjectRelation
	/** 图标：Iconify 图标名或图片 URL，可选 */
	icon?: string
}

/** 关系筛选标签 */
export const relationLabels: Record<ProjectRelation, string> = {
	created: '创建的项目',
	participation: '参与的项目',
	design: '设计的作品',
	using: '正在使用',
}

/** 项目数据 */
export const projects: ProjectItem[] = [
	{
		name: '冰山图宇宙',
		description: '冰山图宇宙（Icebergs），一个探索层层深入知识/话题的冰山图项目。',
		link: 'https://github.com/Gnix807/icebergs-1.0',
		type: 'project',
		relation: 'created',
		icon: 'tabler:mountain',
	},
	{
		name: '个人博客',
		description: '基于 Nuxt 4 + Nuxt Content 的个人博客，Clarity 主题深度定制。',
		link: 'https://github.com/Gnix807/blog',
		type: 'website',
		relation: 'created',
		icon: 'tabler:notebook',
	},
	{
		name: '字幕存档 SubtitleArchive',
		description: '字幕存档项目，现已开源。',
		link: 'https://github.com/Gnix807/SubtitleArchive',
		type: 'project',
		relation: 'created',
		icon: 'tabler:file-text',
	},
	{
		name: 'Clarity 主题',
		description: '本站使用的开源博客主题，做了大量个性化功能扩展。',
		link: 'https://github.com/L33Z22L11/blog-v3',
		type: 'project',
		relation: 'participation',
		icon: 'simple-icons:nuxt',
	},
	{
		name: 'Nuxt',
		description: 'Vue 全栈框架，本站技术底座。',
		link: 'https://nuxt.com/',
		type: 'framework',
		relation: 'using',
		icon: 'tabler:brand-nuxt',
	},
	{
		name: '1Panel',
		description: '现代化服务器运维管理面板，用于部署本站。',
		link: 'https://1panel.cn/',
		type: 'tool',
		relation: 'using',
		icon: 'tabler:server-2',
	},
	{
		name: '雨云 RainYun',
		description: '本站所用的服务器提供商。',
		link: 'https://www.rainyun.com/',
		type: 'server',
		relation: 'using',
		icon: 'tabler:cloud',
	},
]
