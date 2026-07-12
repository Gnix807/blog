import type { Root, Text } from 'mdast'
import { visit } from 'unist-util-visit'

// 中文语境判定：CJK 表意文字、假名，以及常见全角标点
const CTX = '\\u4e00-\\u9fff\\u3040-\\u30ff\\u3400-\\u4dbf，。！？；：、「」『』（）《》【】'
const ctxClass = `[${CTX}]`

/**
 * 中文标点规范化（参考《中文文案排版指南》）：
 * - 双引号统一为直角引号「」（弯引号直接映射；直引号按出现顺序交替配对）
 * - 中文语境下的半角标点转全角
 * 仅作用于文本节点，天然跳过代码块、行内代码与链接地址。
 */
export default function remarkZhPunct() {
	return (tree: Root) => {
		let doubleOpen = true
		visit(tree, 'text', (node: Text) => {
			let v = node.value

			// 弯双引号 → 「」
			v = v.replace(/\u201C/g, '「').replace(/\u201D/g, '」')
			// 直双引号 → 交替「」（跨节点保持状态，正确配对被行内格式打断的引号）
			v = v.replace(/"/g, () => {
				const ch = doubleOpen ? '「' : '」'
				doubleOpen = !doubleOpen
				return ch
			})

			const map: Record<string, string> = { ',': '，', ';': '；', '!': '！', '?': '？', ':': '：' }
			// 中文/全角标点后紧跟的半角 , ; ! ? : → 全角
			v = v.replace(new RegExp(`(${ctxClass})([,;!?:])`, 'g'), (_, a, b) => a + map[b])
			// 句点：中文语境后、且其后为空白/行尾/中文（避免 v3. 、1.2 等）
			v = v.replace(new RegExp(`(${ctxClass})\\.(?=$|[\\s${CTX}])`, 'g'), '$1。')
			// 半角括号内含中文 → 全角括号
			v = v.replace(/\(([^()]*[\u4e00-\u9fff][^()]*)\)/g, '（$1）')

			node.value = v
		})
	}
}
