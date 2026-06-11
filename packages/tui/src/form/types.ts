import type { MaybePromise } from '#tui/types';

export type FormResponses = unknown[] & Record<string, unknown>;

export type FormStep = {
	condition: boolean | ((responses: FormResponses) => boolean);
	ignoreWhenReverting: boolean;
	name?: string;
	run: (responses: FormResponses, previous: unknown, name?: string) => MaybePromise<unknown>;
};
