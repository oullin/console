export type PasswordInputOptions = {
	default?: string;
	hint?: string;
	placeholder?: string;
};

export type PasswordReadResult = {
	cancelled: boolean;
	value: string;
};
