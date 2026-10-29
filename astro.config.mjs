// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://bwvolleyball.github.io',
	integrations: [mdx(), sitemap()],
	markdown: {
		// Code blocks use the design's Prose styles (Plex Mono on panel), not a fixed-color highlighter theme.
		syntaxHighlight: false,
	},
});
