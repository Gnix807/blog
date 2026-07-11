import type { FeedGroup } from '../app/types/feed'
// 友链检测 CLI 需要使用显式导入和相对路径
import { myFeed } from '../blog.config'
// eslint-disable-next-line unused-imports/no-unused-imports
import { getFavicon, getGithubAvatar, getGithubIcon, getOciqGroupAvatar, getOicqAvatar, OicqAvatarSize } from './utils/img'

export default [
	// #region 友链
	{
		name: '友链',
		desc: '相互关注，彼此照亮。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			myFeed,
			// 友链模板：复制下面这段并填写对方信息即可
			// {
			// 	author: '博主昵称',
			// 	sitenick: '站点简称', // 可选
			// 	title: '站点全名', // 可选
			// 	desc: '博客描述',
			// 	link: 'https://example.com/',
			// 	feed: 'https://example.com/atom.xml', // 可选，订阅源地址
			// 	icon: 'https://example.com/favicon.ico', // 站点图标
			// 	avatar: 'https://example.com/avatar.png', // 头像
			// 	archs: ['Nuxt', 'Vercel'], // 技术栈标签
			// 	date: '2026-07-10', // 添加日期
			// 	comment: '一句备注。', // 可选
			// },
		],
	},
	// #endregion
] satisfies FeedGroup[]
