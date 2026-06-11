import { confirm, multiselect, select } from '#tui/prompts/choices';
import { number, password, text, textarea } from '#tui/prompts/basic';
import type {
  ConfirmPromptOptions,
  MultiSelectPromptOptions,
  NumberPromptOptions,
  SelectPromptOptions,
  TextPromptOptions
} from '#tui/types';

export class FormBuilder {
  async text(message: string | TextPromptOptions): Promise<string> {
    return text(message);
  }

  async textarea(message: string | TextPromptOptions): Promise<string> {
    return textarea(message);
  }

  async password(message: string | TextPromptOptions): Promise<string> {
    return password(message);
  }

  async number(message: string | NumberPromptOptions): Promise<number> {
    return number(message);
  }

  async confirm(message: string | ConfirmPromptOptions): Promise<boolean> {
    return confirm(message);
  }

  async select<T>(options: SelectPromptOptions<T>): Promise<T> {
    return select(options);
  }

  async multiselect<T>(options: MultiSelectPromptOptions<T>): Promise<T[]> {
    return multiselect(options);
  }
}

export const form = async <T>(builder: (form: FormBuilder) => Promise<T> | T): Promise<T> => {
  return builder(new FormBuilder());
};
