import { getCollection, type CollectionEntry } from 'astro:content';
import { isExternal, monthKey, newestFirst, type WritingEntry } from './brand';

type Role = CollectionEntry<'experience'>;
type CardRole = Role & { data: Role['data'] & { card: NonNullable<Role['data']['card']> } };

const newestRoleFirst = (a: Role, b: Role) => monthKey(b.data.start) - monthKey(a.data.start);

/** Every role, newest first, for the About timeline. */
export async function getTimeline() {
	return (await getCollection('experience')).sort(newestRoleFirst).map(({ data }) => ({
		start: data.start,
		end: data.end,
		role: data.role,
		company: data.company,
		note: data.note,
	}));
}

/** The five experience cards, newest first, as ExperienceCard props. */
export async function getCards() {
	const roles = (await getCollection('experience')).filter((r): r is CardRole => !!r.data.card).sort(newestRoleFirst);
	return roles.map(({ data: { company, card } }) => ({
		brand: card.brand,
		company,
		dates: card.dates,
		role: card.role,
		summary: card.summary,
		label: card.label,
		visual: card.visual,
		href: card.story ? `/experience/${card.story}` : undefined,
		story: card.story,
	}));
}

/** Writing entries, newest first. Pieces hosted here link to /writing/<id>; the rest keep their own href. */
export async function getWriting(): Promise<(WritingEntry & { id: string })[]> {
	const posts = await getCollection('writing');
	return newestFirst(
		posts.map(({ id, data }) => ({
			id,
			title: data.title,
			href: data.href ?? `/writing/${id}`,
			date: data.published,
			type: data.type,
			topic: data.topic,
			summary: data.summary,
			flagship: data.flagship,
		})),
	) as (WritingEntry & { id: string })[];
}

/** Only the pieces that get a page on this site. */
export async function getLocalPosts() {
	return (await getCollection('writing')).filter(({ data }) => !isExternal({ type: data.type, href: data.href ?? '' }));
}
