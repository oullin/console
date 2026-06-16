import { spin } from '#tui/status';
import { isStatusLabel, parseStatusCallback, parseStatusLabel } from '#tui/form/builder/validators/status';
import type { FormBuilder } from '#tui/form/builder/index';
import type { MaybePromise } from '#tui/types';

export function spinFormStep<T>(this: FormBuilder, callback: () => MaybePromise<T>, message?: string, name?: string): FormBuilder;

export function spinFormStep<T>(this: FormBuilder, message: string, callback: () => MaybePromise<T>, name?: string): FormBuilder;

export function spinFormStep<T>(this: FormBuilder, callbackOrMessage: (() => MaybePromise<T>) | string, messageOrCallback: string | (() => MaybePromise<T>) = '', name?: string): FormBuilder {
	if (isStatusLabel(callbackOrMessage)) {
		return this.add(() => spin(callbackOrMessage, parseStatusCallback<T>(messageOrCallback)), name, true);
	}

	return this.add(() => spin(callbackOrMessage, { message: parseStatusLabel(messageOrCallback) ?? '' }), name, true);
}
