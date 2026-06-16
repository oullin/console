import { Key } from '#tui/key';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderActiveConfirm, renderCancelledConfirm } from '#tui/prompts/select/render-confirm';
import type { ConfirmReadOptions } from '#tui/prompts/select/read-confirm/types';

const toggleKeys = new Set([Key.tab, Key.up, Key.upArrow, Key.down, Key.downArrow, Key.left, Key.leftArrow, Key.right, Key.rightArrow, Key.ctrlP, Key.ctrlF, Key.ctrlN, Key.ctrlB, 'h', 'j', 'k', 'l']);

export type ConfirmReaderSession = {
	cancel(): void;
	frame(): string;
	set(value: boolean): void;
	submission(): { frame: string; value: boolean };
	toggle(): void;
	value(): boolean;
};

export const isConfirmToggleKey = (key: string): boolean => toggleKeys.has(key);

export const confirmDirectValue = (key: string): boolean | null => {
	const normalizedKey = key.toLowerCase();

	if (normalizedKey === 'y') {
		return true;
	}

	if (normalizedKey === 'n') {
		return false;
	}

	return null;
};

export const createConfirmReaderSession = (options: ConfirmReadOptions): ConfirmReaderSession => {
	let confirmed = options.default ?? true;
	let frame = renderActiveConfirm(options, confirmed);

	const redraw = (): void => {
		eraseRenderedFrame(frame);
		frame = renderActiveConfirm(options, confirmed);
	};

	return {
		cancel() {
			eraseRenderedFrame(frame);
			renderCancelledConfirm(options, confirmed);
		},
		frame() {
			return frame;
		},
		set(value) {
			confirmed = value;
			redraw();
		},
		submission() {
			return { frame, value: confirmed };
		},
		toggle() {
			confirmed = !confirmed;
			redraw();
		},
		value() {
			return confirmed;
		},
	};
};
