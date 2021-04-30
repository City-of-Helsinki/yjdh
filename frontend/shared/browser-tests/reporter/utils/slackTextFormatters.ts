export const bold = (text: string): string => `*${text}*`;

export const italics = (text: string): string => `_${text}_`;

export const strike = (text: string): string => `~${text}~`;

export const code = (c: string): string => `\`${  c  }\``;

export const codeBlock = (c: string): string =>
  `\`\`\`${  c  }\`\`\``;

export const quote = (text: string): string => `>${text}`;

export const link = (text: string, lnk: string): string => `<${lnk}|${text}>`;
