export type MaybePromise<T> = T | Promise<T>;

export type ValidationResult = string | false | null | undefined;

export type Validator<T> = (value: T) => MaybePromise<ValidationResult>;

export type PromptValue = string | number | boolean | string[] | number[];

export type PromptOutput = {
  write(content: string): void;
};

export type PromptInput = {
  readKey?(): Promise<string | null>;
  readLine?(message: string): Promise<string>;
};

export type PromptEnvironment = {
  input: PromptInput;
  output: PromptOutput;
  error: PromptOutput;
  interactive: boolean;
};

export type BasePromptOptions<T> = {
  message: string;
  default?: T;
  required?: boolean | string;
  hint?: string;
  validate?: Validator<T>;
};

export type Choice<T = string> = {
  label: string;
  value: T;
  hint?: string;
  disabled?: boolean | string;
};

export type ChoiceInput<T = string> = Choice<T> | T;

export type TextPromptOptions = BasePromptOptions<string> & {
  label?: string;
  options?: string[] | ((query: string) => MaybePromise<string[]>);
  placeholder?: string;
  transform?: (value: string) => MaybePromise<string>;
};

export type NumberPromptOptions = BasePromptOptions<number> & {
  label?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  step?: number;
  transform?: (value: number) => MaybePromise<number>;
};

export type ConfirmPromptOptions = BasePromptOptions<boolean> & {
  label?: string;
  yes?: string;
  no?: string;
};

export type SelectPromptOptions<T> = BasePromptOptions<T> & {
  label?: string;
  options: Array<ChoiceInput<T>>;
  scroll?: number;
  info?: string | ((value: T) => string);
};

export type MultiSelectPromptOptions<T> = BasePromptOptions<T[]> & {
  label?: string;
  options: Array<ChoiceInput<T>>;
  scroll?: number;
  info?: string | ((value: T[]) => string);
};

export type SearchPromptOptions<T> = BasePromptOptions<T> & {
  label?: string;
  options: Array<ChoiceInput<T>> | Record<string, string> | ((query: string) => MaybePromise<Array<ChoiceInput<T>> | Record<string, string>>);
  placeholder?: string;
  scroll?: number;
  info?: string | ((value: T) => string);
};

export type TableOptions = {
  headers?: string[];
  rows: Array<Array<string | number | boolean | null | undefined> | Record<string, string | number | boolean | null | undefined>>;
};

export type StatusOptions = {
  message: string;
};
