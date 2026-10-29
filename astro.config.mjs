// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://bwvolleyball.github.io',
	integrations: [mdx(), sitemap()],
	// Pages retired by the redesign: Projects became case studies, Speaking became Writing, Contact is the closing call to action.
	redirects: {
		'/projects': '/experience',
		'/speaking': '/writing',
		'/contact': '/',
	},
	markdown: {
		// Code blocks use the design's Prose styles (Plex Mono on panel), not a fixed-color highlighter theme.
		syntaxHighlight: false,
	},
});
