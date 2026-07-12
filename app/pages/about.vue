<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
	title: '关于',
	description: `关于 ${appConfig.author.name} 以及这个博客的一切。`,
})

const birthYear = appConfig.component.stats.birthYear
const age = new Date().getFullYear() - birthYear

const contacts = [
	{ icon: 'tabler:brand-github', text: 'Gnix807', url: 'https://github.com/Gnix807' },
	{ icon: 'tabler:brand-bilibili', text: 'Bilibili', url: 'https://space.bilibili.com/96621291' },
	{ icon: 'ri:qq-line', text: '群 203690967', url: 'https://qm.qq.com/q/Msi2AbGtWw' },
	{ icon: 'tabler:mail', text: appConfig.author.email, url: `mailto:${appConfig.author.email}` },
]

const focus = ['技术', '开发', '安全', '杂谈', '生活']
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetCommGroup />
</template>

<div class="about-page">
	<header class="about-header">
		<div class="left-content">
			<h1>关于我</h1>
			<p>{{ appConfig.subtitle }}</p>
		</div>
		<div class="right-content">
			<div class="avatar-frame">
				<UtilImg :src="appConfig.author.avatar" :alt="appConfig.author.name" class="avatar-image" />
			</div>
		</div>
	</header>

	<div class="cards-grid">
		<div class="card intro-card">
			<p>你好，很高兴认识你</p>
			<h2>我叫 {{ appConfig.author.name }}</h2>
			<p>一个热爱折腾的开发者</p>
		</div>

		<div class="card info-card">
			<div class="info-item">
				<span class="label">生于</span>
				<span class="value">{{ birthYear }}</span>
			</div>
			<div class="info-item">
				<span class="label">当前</span>
				<span class="value">{{ age }} 岁</span>
			</div>
		</div>

		<div class="card motto-card">
			<span class="label">座右铭</span>
			<div class="motto-content">
				<p class="motto-text">
					{{ appConfig.subtitle }}
				</p>
				<div class="motto-decoration">
					<div class="decoration-line" />
					<div class="decoration-dot" />
					<div class="decoration-line" />
				</div>
			</div>
		</div>

		<div class="card focus-card">
			<span class="label">关注</span>
			<div class="focus-tags">
				<span v-for="tag in focus" :key="tag" class="focus-tag">{{ tag }}</span>
			</div>
		</div>

		<div class="card site-card">
			<span class="label">本站</span>
			<div class="site-content">
				<h3>倪哥买提大巴扎</h3>
				<p>基于 Nuxt 4 + Nuxt Content 构建，部署在自己的服务器上。</p>
				<div class="site-icons">
					<Icon name="simple-icons:nuxt" />
					<Icon name="simple-icons:vuedotjs" />
					<Icon name="simple-icons:typescript" />
				</div>
			</div>
		</div>

		<div class="card contact-card">
			<span class="label">联系我</span>
			<div class="contact-links">
				<UtilLink v-for="c in contacts" :key="c.text" :to="c.url" :title="c.text">
					<Icon :name="c.icon" />
					<span>{{ c.text }}</span>
				</UtilLink>
			</div>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.about-page {
	padding: 1rem;
}

.about-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1.5rem;

	.left-content {
		h1 {
			margin: 0;
			font-size: 2.2em;
		}

		p {
			margin: 0.5em 0 0;
			color: var(--c-text-2);
		}
	}

	.avatar-frame {
		flex-shrink: 0;
		padding: 4px;
		border-radius: 50%;
		background-image: linear-gradient(135deg, var(--c-primary), var(--c-accent, var(--c-primary)));

		.avatar-image {
			display: block;
			width: 5rem;
			height: 5rem;
			border-radius: 50%;
			border: 3px solid var(--c-bg);
			object-fit: cover;
		}
	}
}

.cards-grid {
	display: grid;
	gap: 0.8rem;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	grid-auto-flow: dense;
}

.card {
	position: relative;
	padding: 1.2rem;
	overflow: hidden;

	.label {
		position: absolute;
		top: 0.8rem;
		inset-inline-end: 1rem;
		font-size: 0.75em;
		color: var(--c-text-3);
	}
}

.intro-card {
	grid-column: span 2;
	background-image: linear-gradient(135deg, var(--c-primary-soft), transparent);

	p {
		margin: 0;
		color: var(--c-text-2);
	}

	h2 {
		margin: 0.3em 0;
		font-size: 1.6em;
		color: var(--c-text);
	}

	@media (max-width: 528px) {
		grid-column: span 1;
	}
}

.info-card {
	display: flex;
	justify-content: space-around;
	text-align: center;

	.info-item {
		display: flex;
		flex-direction: column;

		.label {
			position: static;
		}

		.value {
			margin-top: 0.2em;
			font-size: 1.8em;
			font-weight: 700;
			color: var(--c-primary);
		}
	}
}

.motto-card {
	grid-column: span 2;

	.motto-text {
		margin: 0.5em 0;
		font-size: 1.1em;
		text-align: center;
		color: var(--c-text-1);
	}

	.motto-decoration {
		display: flex;
		align-items: center;
		gap: 0.5em;

		.decoration-line {
			flex-grow: 1;
			height: 1px;
			background-color: var(--c-border);
		}

		.decoration-dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background-color: var(--c-primary);
		}
	}

	@media (max-width: 528px) {
		grid-column: span 1;
	}
}

.focus-card .focus-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4em;
	margin-top: 0.8rem;

	.focus-tag {
		padding: 0.2em 0.7em;
		border-radius: 1em;
		background-color: var(--c-bg-2);
		font-size: 0.85em;
		color: var(--c-text-2);
	}
}

.site-card {
	grid-column: span 2;

	.site-content {
		h3 {
			margin: 0.5rem 0 0.3rem;
		}

		p {
			margin: 0;
			font-size: 0.9em;
			color: var(--c-text-2);
		}

		.site-icons {
			display: flex;
			gap: 0.6em;
			margin-top: 0.6rem;
			font-size: 1.4em;
			color: var(--c-text-3);
		}
	}

	@media (max-width: 528px) {
		grid-column: span 1;
	}
}

.contact-card .contact-links {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-top: 0.8rem;

	a {
		display: flex;
		align-items: center;
		gap: 0.5em;
		color: var(--c-text-2);
		transition: color 0.2s;

		&:hover {
			color: var(--c-primary);
		}
	}
}
</style>
