import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const brand = z.enum(['vanguard', 'stackhawk', 'promontory', 'zenplanner', 'schwab']);
const visual = z.enum(['growth', 'scan', 'cadence', 'migration', 'awards']);

// Every role, for the About timeline. The newest role at each card company also carries its experience `card`.
const experience = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
	schema: z.object({
		role: z.string(),
		company: z.string(),
		location: z.string().optional(),
		/** "Aug 2026" */
		start: z.string(),
		/** "Aug 2026" or "now" */
		end: z.string(),
		highlights: z.array(z.string()).default([]),
		stacks: z.array(z.string()).optional(),
		awards: z.array(z.string()).optional(),
		/** One muted line on the timeline: awards or apps. */
		note: z.string().optional(),
		/** Work that has no card or case study of its own (the Brilliance Android apps). */
		project: z
			.object({
				title: z.string(),
				summary: z.string(),
				problem: z.string(),
				approach: z.string(),
				impact: z.string(),
				tech: z.array(z.string()),
			})
			.optional(),
		card: z
			.object({
				brand,
				/** Can span several roles: "Software Engineer → Senior Software Engineer". */
				role: z.string(),
				/** "Jan 2022 – Aug 2026" */
				dates: z.string(),
				summary: z.string(),
				label: z.string().optional(),
				visual,
				/** Case-study id under /experience/<story>. Omit until there's a story (Vanguard). */
				story: z.string().optional(),
			})
			.optional(),
	}),
});

// The stories behind the cards: blog-like reads (MDX) built from the resume content. Each id matches an experience
// card's `story`. The frontmatter fills the CaseStudyHeader spec sheet; the body is the article.
const caseStudies = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/case-studies' }),
	schema: z.object({
		/** Unapproved copy: shows "Draft · for Brandon to edit". */
		draft: z.boolean().default(false),
		title: z.string(),
		/** Used for the page description. */
		summary: z.string(),
		role: z.string(),
		team: z.string().optional(),
		stack: z.string(),
		outcome: z.string(),
	}),
});

// Essays and talks. Entries with an absolute `href` live elsewhere and get no page here.
const writing = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		/** ISO date ("2024-10-01") or a year ("2024"). */
		published: z.string(),
		topic: z.enum(['cloud', 'mobile', 'architecture']),
		type: z.enum(['essay', 'talk', 'external']),
		/** Featured first and marked "Start here". */
		flagship: z.boolean().optional(),
		href: z.string().url().optional(),
	}),
});

const about = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
	schema: z.object({
		draft: z.boolean().default(false),
	}),
});

export const collections = { experience, caseStudies, writing, about };
