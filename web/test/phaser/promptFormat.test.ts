import { describe, expect, it } from "vitest";
import { CHAPTERS } from "@/lib/domain/chapters";
import { formatPrompt } from "@/lib/phaser/battle/promptFormat";

describe("formatPrompt", () => {
  it("leaves a plain question alone", () => {
    expect(formatPrompt("커밋마다 붙는 고유한 식별자는?")).toEqual({ code: [], text: "커밋마다 붙는 고유한 식별자는?" });
  });

  it("quotes inline code in place of its backticks", () => {
    expect(formatPrompt("`git fetch`와 `git pull`의 차이는?").text).toBe("'git fetch'와 'git pull'의 차이는?");
  });

  it("lifts whole-line code into a snippet, keeping its indentation", () => {
    expect(formatPrompt("`for i in range(2):`\n`    for j in range(3):`\n안쪽 코드는 총 몇 번 실행되나요?")).toEqual({
      code: ["for i in range(2):", "    for j in range(3):"],
      text: "안쪽 코드는 총 몇 번 실행되나요?",
    });
  });

  it("never leaves a backtick in any chapter's quiz prompt", () => {
    const prompts = CHAPTERS.flatMap((chapter) =>
      chapter.stages.flatMap((stage) => stage.quizPool.map((question) => question.prompt))
    );
    expect(prompts.length).toBeGreaterThan(200);
    for (const prompt of prompts) {
      const { code, text } = formatPrompt(prompt);
      expect([...code, text].join("\n")).not.toContain("`");
    }
  });
});
