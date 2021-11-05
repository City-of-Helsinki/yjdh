export const bold = (text: string): string => `*${text}*`;

export const italics = (text: string): string => `_${text}_`;

export const strike = (text: string): string => `~${text}~`;

export const code = (codeText: string): string => `\`${codeText}\``;

export const codeBlock = (codeBlockText: string): string =>
  `\`\`\`${codeBlockText}\`\`\``;

export const quote = (text: string): string => `>${text}`;

export const link = (text: string, linkText: string): string =>
  `<${linkText}|${text}>`;
