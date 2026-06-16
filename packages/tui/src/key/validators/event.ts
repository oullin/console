import { z } from 'zod';
import type { KeyboardEventLike } from '#tui/key/types';

const keyboardEventSchema = z
	.object({
		ctrl: z.boolean().optional(),
		meta: z.boolean().optional(),
		name: z.string().optional(),
		sequence: z.string().optional(),
		shift: z.boolean().optional(),
	})
	.catch({});

export const parseKeyboardEvent = (event: unknown): KeyboardEventLike => {
	return keyboardEventSchema.parse(event);
};
