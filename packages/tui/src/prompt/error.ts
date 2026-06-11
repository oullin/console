export class PromptValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PromptValidationError';
	}
}
