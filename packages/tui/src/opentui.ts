import { Text } from '@opentui/core';
import { createTestRenderer } from '@opentui/core/testing';

export type OpenTuiFrame = {
  text: string;
};

export const renderOpenTuiTextFrame = async (text: string, size: { width?: number; height?: number } = {}): Promise<OpenTuiFrame> => {
  const { renderer, renderOnce, captureCharFrame } = await createTestRenderer({
    width: size.width ?? 80,
    height: size.height ?? 24
  });

  try {
    renderer.root.add(Text({ content: text }));
    await renderOnce();

    return { text: captureCharFrame() };
  } finally {
    renderer.destroy();
  }
};
