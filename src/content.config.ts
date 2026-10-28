import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const experience = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
	schema: z.object({
		role: z.string(),
		company: z.string(),
		location: z.string(),
		start: z.string(),
		end: z.string(),
		highlights: z.array(z.string()),
		stacks: z.array(z.string()).optional(),
		awards: z.array(z.string()).optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		summary: z.string(),
		problem: z.string(),
		approach: z.string(),
		impact: z.string(),
		metrics: z.array(z.string()).optional(),
		tech: z.array(z.string()),
	}),
});

const speaking = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/speaking' }),
	schema: z.object({
		title: z.string(),
		event: z.string(),
		location: z.string(),
		link: z.string().url().optional(),
		date: z.string(),
		tags: z.array(z.string()).optional(),
	}),
});

const writing = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		published: z.string(),
		external: z.string().url().optional(),
	}),
});

export const collections = { experience, projects, speaking, writing };
