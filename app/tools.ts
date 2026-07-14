export interface ToolItem {
	name: string
	description: string
	icon: string
	category: 'image' | 'text' | 'dev' | 'media'
}

export const tools: ToolItem[] = [
	{
		name: '图片格式转换',
		description: '纯前端浏览器端转换，支持 WebP / PNG / JPEG 互转，可调质量。',
		icon: 'tabler:photo',
		category: 'image',
	},
	{
		name: '图片水印',
		description: '上传图片，添加文字水印。支持平铺、旋转、透明度调节。',
		icon: 'tabler:photo',
		category: 'image',
	},
	{
		name: 'Base64 编解码',
		description: 'Base64 编码与解码，支持中文，纯浏览器端。',
		icon: 'tabler:binary',
		category: 'dev',
	},
	{
		name: 'URL 编解码',
		description: 'URL 编码与解码（encodeURIComponent），纯浏览器端。',
		icon: 'tabler:link',
		category: 'dev',
	},
	{
		name: 'JSON 格式化',
		description: 'JSON 格式化、压缩、按 key 排序，可调缩进。',
		icon: 'tabler:braces',
		category: 'dev',
	},
	{
		name: 'UUID 生成器',
		description: '批量生成 UUID v4，支持复制。基于 crypto.randomUUID()。',
		icon: 'tabler:key',
		category: 'dev',
	},
	{
		name: '时间戳转换',
		description: '时间戳与日期互转，支持秒级/毫秒级，实时显示当前时间戳。',
		icon: 'tabler:clock',
		category: 'dev',
	},
]

export const categoryLabels: Record<ToolItem['category'], string> = {
	image: '图片工具',
	text: '文本工具',
	dev: '开发工具',
	media: '媒体工具',
}
