<script setup lang="ts">
import Badge from '@docs-ui/badge/Badge.vue';
import Card from '@docs-ui/card/Card.vue';
import CardContent from '@docs-ui/card/CardContent.vue';
import CardHeader from '@docs-ui/card/CardHeader.vue';
import CardTitle from '@docs-ui/card/CardTitle.vue';
import Separator from '@docs-ui/separator/Separator.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Terminal } from '@xterm/xterm';
import type { ITheme } from '@xterm/xterm';

const props = withDefaults(
	defineProps<{
		animated?: boolean;
		colour?: boolean;
		delay?: number;
		frames?: string[][];
		lines?: string[];
		loop?: boolean;
		rows?: number;
		title?: string;
	}>(),
	{
		animated: true,
		colour: true,
		delay: 360,
		frames: undefined,
		lines: () => [],
		loop: false,
		rows: undefined,
		title: 'console',
	},
);

const viewport = ref<HTMLDivElement | null>(null);

let terminal: Terminal | null = null;
let observer: IntersectionObserver | null = null;
let timers: ReturnType<typeof setTimeout>[] = [];
let hasPainted = false;
let visible = false;

const terminalTheme: ITheme = {
	background: '#0c0f14',
	black: '#111827',
	blue: '#60a5fa',
	brightBlack: '#4b5563',
	brightBlue: '#93c5fd',
	brightCyan: '#67e8f9',
	brightGreen: '#86efac',
	brightMagenta: '#f0abfc',
	brightRed: '#fca5a5',
	brightWhite: '#f9fafb',
	brightYellow: '#fde68a',
	cursor: '#22d3ee',
	cyan: '#22d3ee',
	foreground: '#e5e7eb',
	green: '#22c55e',
	magenta: '#d946ef',
	red: '#ef4444',
	selectionBackground: '#164e63',
	white: '#e5e7eb',
	yellow: '#facc15',
};

const frames = computed((): string[][] => {
	if (props.frames && props.frames.length > 0) {
		return props.frames;
	}

	if (!props.animated) {
		return [props.lines];
	}

	return props.lines.map((_, index) => props.lines.slice(0, index + 1));
});

const output = computed(() => frames.value.map((frame) => frame.join('\n')).join('\n---\n'));

const ansi = {
	cyan: '\u001B[36m',
	dim: '\u001B[2m',
	green: '\u001B[32m',
	reset: '\u001B[0m',
	yellow: '\u001B[33m',
};

const colourise = (line: string): string => {
	if (!props.colour) {
		return line;
	}

	if (line.startsWith('? ')) {
		return `${ansi.cyan}?${ansi.reset}${line.slice(1)}`;
	}

	if (line.startsWith('> ')) {
		return `${ansi.green}>${ansi.reset}${line.slice(1)}`;
	}

	if (line.startsWith('  ')) {
		return `${ansi.green}${line}${ansi.reset}`;
	}

	if (/warning|default|review/iu.test(line)) {
		return `${ansi.yellow}${line}${ansi.reset}`;
	}

	if (/complete|done|published|ready|installed|success/iu.test(line)) {
		return `${ansi.green}${line}${ansi.reset}`;
	}

	if (/package|release|runtime|reviewer|name|visibility|purpose/iu.test(line)) {
		return `${ansi.cyan}${line}${ansi.reset}`;
	}

	return `${ansi.dim}${line}${ansi.reset}`;
};

const clearTimers = (): void => {
	for (const timer of timers) {
		clearTimeout(timer);
	}

	timers = [];
};

const writeFrame = (frame: string[]): void => {
	if (!terminal) {
		return;
	}

	terminal.reset();

	for (const line of frame) {
		terminal.writeln(colourise(line));
	}
};

const paint = (): void => {
	if (!terminal) {
		return;
	}

	clearTimers();

	if (!props.animated) {
		writeFrame(frames.value.at(-1) ?? []);

		return;
	}

	frames.value.forEach((frame, index) => {
		timers.push(
			setTimeout(() => {
				writeFrame(frame);

				if (props.loop && index === frames.value.length - 1) {
					timers.push(setTimeout(paint, props.delay));
				}
			}, index * props.delay),
		);
	});
};

const paintWhenVisible = (): void => {
	if (!visible || hasPainted) {
		return;
	}

	hasPainted = true;
	paint();
};

onMounted(async () => {
	const { Terminal } = await import('@xterm/xterm');

	terminal = new Terminal({
		convertEol: true,
		cursorBlink: false,
		disableStdin: true,
		fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
		fontSize: 13,
		lineHeight: 1.45,
		overviewRulerWidth: 0,
		rows: props.rows ?? Math.max(2, ...frames.value.map((frame) => frame.length)),
		scrollback: 0,
		theme: terminalTheme,
	});

	await nextTick();

	if (viewport.value) {
		terminal.open(viewport.value);
	}

	window.requestAnimationFrame(() => {
		visible = true;
		hasPainted = false;
		paintWhenVisible();
	});

	if (!viewport.value || typeof IntersectionObserver === 'undefined') {
		return;
	}

	observer = new IntersectionObserver(
		(entries) => {
			visible = entries.some((entry) => entry.isIntersecting);
			paintWhenVisible();
		},
		{ threshold: 0.35 },
	);
	observer.observe(viewport.value);
});

onBeforeUnmount(() => {
	clearTimers();
	observer?.disconnect();
	observer = null;
	terminal?.dispose();
	terminal = null;
});

watch(output, () => {
	hasPainted = false;
	paintWhenVisible();
});
</script>

<template>
	<Card class="my-4 gap-0 overflow-hidden border-border bg-card py-0 shadow-sm">
		<CardHeader class="flex flex-row items-center gap-2 bg-muted/40 px-3 py-2">
			<Badge as="span" aria-hidden="true" class="size-2.5 rounded-full border-0 bg-[var(--terminal-danger)] p-0 shadow-none" />
			<Badge as="span" aria-hidden="true" class="size-2.5 rounded-full border-0 bg-[var(--terminal-warning)] p-0 shadow-none" />
			<Badge as="span" aria-hidden="true" class="size-2.5 rounded-full border-0 bg-[var(--terminal-success)] p-0 shadow-none" />
			<CardTitle class="ml-1 font-mono text-xs font-medium text-muted-foreground">{{ title }}</CardTitle>
		</CardHeader>
		<Separator />
		<CardContent class="bg-[var(--terminal-background)] p-3">
			<div ref="viewport" class="min-h-16 overflow-hidden" />
		</CardContent>
	</Card>
</template>
