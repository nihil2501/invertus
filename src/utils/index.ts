export const EXTENSION_ID = "invertus";

export const MESSAGE: Record<string, `${string}-${typeof EXTENSION_ID}`> = {
  TOGGLE: `toggle-${EXTENSION_ID}`,
  VISITED: `visited-${EXTENSION_ID}`,
} as const;
