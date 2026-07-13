import { readdir, readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const ALLOWED_EXTENSIONS = new Set(['.vue', '.ts', '.js', '.tsx', '.jsx', '.css', '.json', '.html', '.md'])
const EXCLUDED_FILES = new Set(['index.md'])

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const dir = query.dir

	if (!dir || typeof dir !== 'string') {
		throw createError({ statusCode: 400, message: 'Missing dir parameter' })
	}

	const contentRoot = resolve('content')
	const requestedDir = resolve(join('content', dir))

	if (!requestedDir.startsWith(contentRoot)) {
		throw createError({ statusCode: 403, message: 'Access denied' })
	}

	let entries
	try {
		entries = await readdir(requestedDir, { withFileTypes: true })
	}
	catch {
		throw createError({ statusCode: 404, message: 'Directory not found' })
	}

	const files: Record<string, string> = {}
	await Promise.all(
		entries
			.filter(e => e.isFile() && ALLOWED_EXTENSIONS.has(extname(e.name)) && !EXCLUDED_FILES.has(e.name))
			.map(async (entry) => {
				const content = await readFile(join(requestedDir, entry.name), 'utf-8')
				files[`/${entry.name}`] = content
			}),
	)

	return files
})
