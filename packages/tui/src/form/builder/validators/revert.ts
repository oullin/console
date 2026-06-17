import { z } from 'zod';
import { FormRevertedError } from '#tui/form/builder/revert';

const formRevertedErrorSchema = z.instanceof(FormRevertedError);

export const isFormRevertedError = (error: unknown): error is FormRevertedError => {
	return formRevertedErrorSchema.safeParse(error).success;
};
