export const bold = (text: string): string => `*${text}*`;

export const italics = (text: string): string => `_${text}_`;

export const strike = (text: string): string => `~${text}~`;

export const code = (code: string): string => '`' + code + '`';

export const codeBlock = (codeBlock: string): string =>
  '```' + codeBlock + '```';

export const quote = (text: string): string => `>${text}`;

export const link = (text: string, link: string): string => `<${link}|${text}>`;
