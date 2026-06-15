import { stream } from '#tui/status';
import { isStatusLabel, isStreamSource } from '#tui/form/builder/validators/status';
import type { FormBuilder } from '#tui/form/builder/index';
import type { Stream } from '#tui/status';

export function streamFormStep(this: FormBuilder, name?: string): FormBuilder;

export function streamFormStep(this: FormBuilder): FormBuilder;

export function streamFormStep(this: FormBuilder, source: AsyncIterable<string> | Iterable<string>, name?: string): FormBuilder;

export function streamFormStep(this: FormBuilder, sourceOrName?: AsyncIterable<string> | Iterable<string> | string, name?: string): FormBuilder {
	if (isStatusLabel(sourceOrName)) {
		return this.add(() => stream() as Stream, sourceOrName);
	}

	if (!isStreamSource(sourceOrName)) {
		return this.add(() => stream() as Stream);
	}

	return this.addSideEffect(() => stream(sourceOrName), name);
}
