// Pure helpers ported from the design system's BrandonWard.util (personal-brand-design/project/components/bundle.js).
import { site } from '../config/site';

export type Topic = 'cloud' | 'mobile' | 'architecture';
export type EntryType = 'essay' | 'talk' | 'external';
export type Brand = 'vanguard' | 'stackhawk' | 'promontory' | 'zenplanner' | 'schwab';
export type VisualKey = 'growth' | 'scan' | 'cadence' | 'migration' | 'awards';

export const TOPICS: Record<Topic, string> = { cloud: 'Cloud', mobile: 'Mobile', architecture: 'Architecture' };
export const TOPIC_KEYS = Object.keys(TOPICS) as Topic[];
export const TYPES: Record<EntryType, string> = { essay: 'Essay', talk: 'Talk', external: 'External' };

export const LINKEDIN = site.linkedin;

export interface WritingEntry {
	title: string;
	href: string;
	/** ISO date ('2024-10-01') or a year ('2024'). */
	date: string;
	type: EntryType;
	topic: Topic;
	summary?: string;
	flagship?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2024-10-01' → 'Oct 2024'; anything else is returned unchanged. */
export function formatMonth(iso: string): string {
	const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(String(iso));
	if (!m) return iso;
	const mon = +m[2];
	return mon >= 1 && mon <= 12 ? `${MONTHS[mon - 1]} ${m[1]}` : iso;
}

/** 'Aug 2026' → a sortable number; 'now' / 'Present' sort last. */
export function monthKey(text: string): number {
	const m = /^([A-Z][a-z]{2}) (\d{4})$/.exec(text.trim());
	if (!m) return Number.MAX_SAFE_INTEGER;
	return +m[2] * 12 + MONTHS.indexOf(m[1]);
}

/** CSS custom properties for a brand card: fill, text on the fill, and the accent. */
export function brandStyle(brand: Brand): string {
	const v = (n: string) => `var(--brand-${brand}-${n})`;
	const gradient = brand === 'vanguard';
	const fill = gradient ? `linear-gradient(135deg, ${v('fill-from')} 0%, ${v('fill-to')} 70%)` : v('fill');
	return `--xp-fill: ${fill}; --xp-on: ${v('on')}; --xp-accent: ${gradient ? v('on') : v('accent')}`;
}

/** True for type 'external' or any absolute http(s) href. */
export function isExternal(entry: Pick<WritingEntry, 'type' | 'href'>): boolean {
	return entry.type === 'external' || /^https?:\/\//i.test(entry.href || '');
}

function dateKey(e: WritingEntry): string {
	return `${e.date || ''}-00-00`.slice(0, 10);
}

export function newestFirst(entries: WritingEntry[]): WritingEntry[] {
	return entries.slice().sort((a, b) => (dateKey(b) < dateKey(a) ? -1 : dateKey(b) > dateKey(a) ? 1 : 0));
}

/** Newest first; the newest flagship entry is featured even when older. */
export function splitFeatured(entries: WritingEntry[]): { featured: WritingEntry | null; rest: WritingEntry[] } {
	const sorted = newestFirst(entries);
	if (!sorted.length) return { featured: null, rest: [] };
	const featured = sorted.find((e) => e.flagship) ?? sorted[0];
	return { featured, rest: sorted.filter((e) => e !== featured) };
}

export function filterByTopic(entries: WritingEntry[], topic: Topic | null): WritingEntry[] {
	return topic ? entries.filter((e) => e.topic === topic) : entries.slice();
}

let uid = 0;
/** A page-unique id for SVG gradients, menu panels and the like. */
export function uniqueId(prefix: string): string {
	uid += 1;
	return `${prefix}-${uid.toString(36)}`;
}
