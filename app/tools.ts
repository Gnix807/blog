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
		description: '上传图片，添加文字水印。可调节位置、大小、透明度。',
		icon: 'tabler:photo',
		category: 'image',
	},
]

export const categoryLabels: Record<ToolItem['category'], string> = {
	image: '图片工具',
	text: '文本工具',
	dev: '开发工具',
	media: '媒体工具',
}
