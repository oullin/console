export type OpenTuiFrame = {
  text: string;
};

export const createOpenTuiTextFrame = (text: string): OpenTuiFrame => ({ text });
