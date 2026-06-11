export type InfoResolver<T> = string | ((value: T | null) => string | null | undefined) | undefined;

export const resolveInfo = <T>(info: InfoResolver<T>, value: T | null): string => {
  if (typeof info === 'function') {
    return info(value) ?? '';
  }

  return info ?? '';
};
