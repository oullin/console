import stringWidth from 'string-width';
import stripAnsi from 'strip-ansi';

export const visibleWidth = (value: string): number => stringWidth(stripAnsi(value));

export const truncate = (value: string, width: number, marker = '...'): string => {
  if (width <= 0) {
    return '';
  }

  if (visibleWidth(value) <= width) {
    return value;
  }

  if (width <= marker.length) {
    return marker.slice(0, width);
  }

  let result = '';

  for (const char of value) {
    if (visibleWidth(`${result}${char}${marker}`) > width) {
      return `${result}${marker}`;
    }

    result += char;
  }

  return result;
};

export const wrap = (value: string, width: number): string[] => {
  if (width <= 0) {
    return [value];
  }

  const lines: string[] = [];

  for (const originalLine of value.split('\n')) {
    let line = '';

    for (const word of originalLine.split(/(\s+)/u)) {
      if (visibleWidth(`${line}${word}`) <= width) {
        line += word;
        continue;
      }

      if (line.length > 0) {
        lines.push(line.trimEnd());
        line = '';
      }

      if (visibleWidth(word) > width) {
        let chunk = '';

        for (const char of word) {
          if (visibleWidth(`${chunk}${char}`) > width) {
            lines.push(chunk);
            chunk = '';
          }

          chunk += char;
        }

        line = chunk;
        continue;
      }

      line = word.trimStart();
    }

    lines.push(line.trimEnd());
  }

  return lines;
};

export const parseAnsiText = (value: string): string => stripAnsi(value);
