// Count-ups for CountUpBars and AwardMedals: 0 → max, hold, then start over.
// The markup is rendered at its final frame, so under reduced motion (or without JS) nothing ever shows "0".
// Each count-up runs only while it's on screen.

const reduceQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const isReduced = () => !!reduceQuery?.matches;

// Read the motion tokens once, not on every tick.
const rootStyle = getComputedStyle(document.documentElement);
function msToken(name: string, fallback: number): number {
	const v = rootStyle.getPropertyValue(`--${name}`).trim();
	const n = parseFloat(v);
	return n ? (/ms$/.test(v) ? n : n * 1000) : fallback;
}
const STEPS: Record<string, number> = {
	'count-step-fast': msToken('count-step-fast', 140),
	'count-step-slow': msToken('count-step-slow', 380),
};

type State = { v: number; hold: number };
function countStep(s: State, max: number, holdTicks: number): State {
	if (s.v < max) return { v: s.v + 1, hold: 0 };
	if (s.hold < holdTicks) return { v: s.v, hold: s.hold + 1 };
	return { v: 0, hold: 0 };
}

interface CountUp {
	start(): void;
	stop(): void;
	showFinal(): void;
}

function setup(el: HTMLElement): CountUp {
	const max = Number(el.dataset.countup) || 0;
	const suffix = el.dataset.countupSuffix ?? '';
	const stepMs = STEPS[el.dataset.countupStep ?? ''] ?? 140;
	const holdTicks = Math.max(12, Math.round(3600 / stepMs) - max);
	const value = el.querySelector<HTMLElement>('[data-countup-value]');
	const items = Array.from(el.querySelectorAll<Element>('[data-countup-item]'));
	let state: State = { v: max, hold: 0 };
	let started = false;
	let timer: number | undefined;

	const render = () => {
		if (value) value.textContent = `${state.v}${suffix}`;
		items.forEach((item, i) => item.classList.toggle('bw-on', i < state.v));
	};
	return {
		start() {
			if (timer !== undefined || isReduced()) return;
			if (!started) {
				started = true;
				state = { v: 0, hold: 0 };
				render();
			}
			timer = window.setInterval(() => {
				state = countStep(state, max, holdTicks);
				render();
			}, stepMs);
		},
		stop() {
			window.clearInterval(timer);
			timer = undefined;
		},
		showFinal() {
			this.stop();
			state = { v: max, hold: 0 };
			render();
		},
	};
}

const counters = new Map<Element, CountUp>();
document.querySelectorAll<HTMLElement>('[data-countup]').forEach((el) => counters.set(el, setup(el)));

const visible = new Set<Element>();
const observer =
	'IntersectionObserver' in window
		? new IntersectionObserver((entries) => {
				for (const entry of entries) {
					const c = counters.get(entry.target);
					if (!c) continue;
					if (entry.isIntersecting) {
						visible.add(entry.target);
						c.start();
					} else {
						visible.delete(entry.target);
						c.stop();
					}
				}
			})
		: null;

if (observer) counters.forEach((_, el) => observer.observe(el));
else counters.forEach((c) => c.start());

reduceQuery?.addEventListener?.('change', () => {
	if (isReduced()) counters.forEach((c) => c.showFinal());
	else visible.forEach((el) => counters.get(el)?.start());
});
