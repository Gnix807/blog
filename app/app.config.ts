import type { Nav, NavItem } from '~/types/nav'
import { pascalCase } from 'es-toolkit/string'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '~~/blog.config'
import { name, version } from '~~/package.json'

// 图标查询：https://yesicon.app/tabler
// 图标插件：https://marketplace.visualstudio.com/items?itemName=antfu.iconify

// @keep-sorted
export default defineAppConfig({
	// 将 blog.config 中的配置项复制到 appConfig，方便调用
	...blogConfig,

	/** 侧栏公告卡片内容，支持 HTML；留空则不显示 */
	announcement: '欢迎来到倪哥买提大巴扎！这里分享技术与生活。',

	/** GitHub 卡片展示的用户名，留空则不显示 */
	githubUsername: 'Gnix807',

	/** 友圈聚合 API 地址（friend-circle-lite 等后端返回的 JSON 接口），留空则显示部署提示 */
	friendCircleApi: '',

	component: {
		alert: {
			/** 默认使用卡片风格还是扁平风格 */
			defaultStyle: 'card' as 'card' | 'flat',
		},

		codeblock: {
			/** 代码块触发折叠的行数 */
			triggerRows: 32,
			/** 代码块折叠后的行数 */
			collapsedRows: 16,
			/** 启用代码块缩进导航会关闭空格渲染 */
			enableIndentGuide: true,
			/** 代码块缩进导航(Indent Guige)竖线匹配空格数 */
			indent: 4,
			/** tab渲染宽度 */
			tabSize: 3,
		},

		/** 文章开头摘要 */
		excerpt: {
			animation: true,
			caret: '_',
		},

		/** 精选文章 Slide */
		slide: {
			/** 适合封面图无字时启用 */
			showTitle: true,
		},

		stats: {
			/** 归档页面每年标题对应的年龄 */
			birthYear: 2004,
			/** blog-stats widget 的预置文本 */
			wordCount: '约1万',
		},
	},

	// @keep-sorted
	footer: {
		/** 页脚版权信息，支持 <br> 换行等 HTML 标签 */
		copyright: `© ${Temporal.Now.plainDateISO().year.toString()} ${blogConfig.author.name}`,
		/** 侧边栏底部图标导航 */
		iconNav: [
			{ icon: 'tabler:home', text: '个人主页', url: blogConfig.author.homepage },
			{ icon: 'tabler:brand-github', text: 'GitHub: Gnix807', url: 'https://github.com/Gnix807' },
			{ icon: 'tabler:brand-bilibili', text: 'Bilibili 主页', url: 'https://space.bilibili.com/96621291' },
			{ icon: 'ri:qq-line', text: 'QQ群: 203690967', url: 'https://qm.qq.com/q/Msi2AbGtWw' },
			{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
		] satisfies NavItem[],
		/** 页脚站点地图 */
		nav: [
			{
				title: '探索',
				items: [
					{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
				],
			},
			{
				title: '社交',
				items: [
					{ icon: 'tabler:brand-github', text: 'Gnix807', url: 'https://github.com/Gnix807' },
					{ icon: 'tabler:brand-bilibili', text: 'Bilibili', url: 'https://space.bilibili.com/96621291' },
					{ icon: 'ri:qq-line', text: '群: 203690967', url: 'https://qm.qq.com/q/Msi2AbGtWw' },
					{ icon: 'tabler:mail', text: blogConfig.author.email, url: `mailto:${blogConfig.author.email}` },
				],
			},
			{
				title: '信息',
				items: [
					{ icon: 'simple-icons:nuxt', text: `主题: ${pascalCase(name)} ${version}`, url: 'https://github.com/L33Z22L11/blog-v3' },
					{ icon: 'tabler:color-swatch', text: '主题和组件文档', url: '/theme' },
					{ icon: 'tabler:certificate', text: '倪ICP备2026030320号', url: blogConfig.author.homepage },
				],
			},
		] satisfies Nav,
	},

	/** 左侧栏顶部 Logo */
	header: {
		logo: '/logo.png',
		/** 展示标题文本，否则展示纯 Logo */
		showTitle: true,
		subtitle: blogConfig.subtitle,
		emojiTail: ['🌊', '🎸', '🏜️', '🐟', '🌃'],
	},

	/** 友链页面 */
	link: {
		/** 无订阅源展示静音图标 */
		remindNoFeed: true,
		/** 友链分组内随机排序 */
		randomInGroup: true,
	},

	/** 左侧栏导航 */
	nav: [
		{
			title: '',
			items: [
				{ icon: 'tabler:files', text: '文章', url: '/' },
				{ icon: 'tabler:bulb', text: '即刻', url: '/essays' },
				{ icon: 'tabler:users-group', text: '友圈', url: '/fc' },
				{ icon: 'tabler:movie', text: '番剧', url: '/anime' },
				{ icon: 'tabler:code', text: '项目', url: '/projects' },
				{ icon: 'tabler:hash', text: '标签', url: '/tags' },
				{ icon: 'tabler:link', text: '友链', url: '/link' },
				{ icon: 'tabler:archive', text: '归档', url: '/archive' },
				{ icon: 'tabler:user', text: '关于', url: '/about' },
			],
		},
	] satisfies Nav,

	pagination: {
		perPage: 10,
		/** 默认排序方式，需要是 this.article.order 中的键名 */
		sortOrder: 'date' as keyof typeof blogConfig.article.order,
		/** 允许（普通/预览/归档）文章列表正序，开启后排序方式左侧图标可切换顺序 */
		allowAscending: false,
	},

	themes: {
		light: {
			icon: 'tabler:sun',
			tip: '浅色模式',
		},
		system: {
			icon: 'tabler:device-desktop',
			tip: '跟随系统',
		},
		dark: {
			icon: 'tabler:moon',
			tip: '深色模式',
		},
	},
})
