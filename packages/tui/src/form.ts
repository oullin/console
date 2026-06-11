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
    return typeof message === 'string' ? text(message) : text(message);
  }

  async textarea(message: string | TextPromptOptions): Promise<string> {
    return typeof message === 'string' ? textarea(message) : textarea(message);
  }

  async password(message: string | TextPromptOptions): Promise<string> {
    return typeof message === 'string' ? password(message) : password(message);
  }

  async number(message: string | NumberPromptOptions): Promise<number> {
    return typeof message === 'string' ? number(message) : number(message);
  }

  async confirm(message: string | ConfirmPromptOptions): Promise<boolean> {
    return typeof message === 'string' ? confirm(message) : confirm(message);
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
