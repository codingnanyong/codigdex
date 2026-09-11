export interface FormattedPrompt {
  /** Lines written entirely as `code`, backticks removed and indentation kept. */
  code: string[];
  /** The question itself, with inline `code` quoted where it stands. */
  text: string;
}

const WHOLE_LINE_CODE = /^`([^`]*)`$/;

/**
 * Quiz prompts mark code with markdown backticks, which a Phaser Text would
 * print literally. Whole-line code becomes a separate snippet; inline code
 * keeps its place in the sentence, quoted so its edges still read.
 */
export function formatPrompt(prompt: string): FormattedPrompt {
  const code: string[] = [];
  const text: string[] = [];
  for (const line of prompt.split("\n")) {
    const match = WHOLE_LINE_CODE.exec(line.trim());
    if (match) {
      code.push(match[1]);
    } else {
      text.push(line.replace(/`([^`]+)`/g, "'$1'"));
    }
  }
  return { code, text: text.join("\n") };
}
