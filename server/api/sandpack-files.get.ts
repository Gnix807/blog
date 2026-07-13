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
	const sandpackRoot = resolve('sandpack-demos')

	const tryDirs = [resolve(join('sandpack-demos', dir)), resolve(join('content', dir))]

	let entries: any[] | undefined
	let matchedDir = ''
	for (const requestedDir of tryDirs) {
		if (!requestedDir.startsWith(sandpackRoot) && !requestedDir.startsWith(contentRoot)) {
			throw createError({ statusCode: 403, message: 'Access denied' })
		}
		try {
			entries = await readdir(requestedDir, { withFileTypes: true })
			matchedDir = requestedDir
			break
		}
		catch {
			// try next directory
		}
	}

	if (!entries) {
		throw createError({ statusCode: 404, message: 'Directory not found' })
	}

	const files: Record<string, string> = {}
	await Promise.all(
		entries
			.filter(e => e.isFile() && ALLOWED_EXTENSIONS.has(extname(e.name)) && !EXCLUDED_FILES.has(e.name))
			.map(async (entry) => {
				const content = await readFile(join(matchedDir, entry.name), 'utf-8')
				files[`/${entry.name}`] = content
			}),
	)

	return files
})
