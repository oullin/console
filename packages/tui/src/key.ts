export const Key = {
  backspace: 'backspace',
  delete: 'delete',
  down: 'down',
  end: 'end',
  enter: 'enter',
  escape: 'escape',
  home: 'home',
  left: 'left',
  right: 'right',
  space: 'space',
  tab: 'tab',
  up: 'up'
} as const;

export type KeyName = (typeof Key)[keyof typeof Key];

export type KeyboardEventLike = {
  name?: string;
  sequence?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
};

export const keyFromEvent = (event: KeyboardEventLike): KeyName | string => {
  if (event.name && event.name in Key) {
    return Key[event.name as keyof typeof Key];
  }

  if (event.sequence === ' ') {
    return Key.space;
  }

  if (event.sequence === '\r' || event.sequence === '\n') {
    return Key.enter;
  }

  return event.name ?? event.sequence ?? '';
};
