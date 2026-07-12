export type ProjectRelation = 'created' | 'participation' | 'design'

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
}

/** 项目数据 */
export const projects: ProjectItem[] = [
	{
		name: '个人博客',
		description: '基于 Nuxt 4 + Nuxt Content 的个人博客，Clarity 主题深度定制。',
		link: 'https://github.com/Gnix807/blog',
		type: 'website',
		relation: 'created',
		icon: 'tabler:notebook',
	},
	{
		name: 'Clarity 主题',
		description: '本站使用的开源博客主题，做了大量个性化功能扩展。',
		link: 'https://github.com/L33Z22L11/blog-v3',
		type: 'project',
		relation: 'participation',
		icon: 'simple-icons:nuxt',
	},
]
