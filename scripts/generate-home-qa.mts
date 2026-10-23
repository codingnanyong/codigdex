import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { careerPathFor } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { createBattleState, revealBattleHint, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { drawMixedQuizQuestions, quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { createQaRandom, HOME_QA_SEED } from "@codigdex/game-core/domain/dex/qaRandom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
type Command = string | Record<string, unknown>;
const files = new Map<string, string>();
const appId = "com.codingnanyong.codigdex";
const features = [
  { id: "cod-235", branch: "test/cod-235-mixed-quiz", name: "Mixed quiz, hints and grading" },
  { id: "cod-234", branch: "test/cod-234-mobile-battle-ui", name: "Battle UI and capture" },
  { id: "cod-236", branch: "test/cod-236-mobile-qa", name: "Startup, locale and error recovery" },
  { id: "cod-237", branch: "test/cod-237-mobile-world-map", name: "World map and sequential unlocks" },
  { id: "cod-238", branch: "test/cod-238-mobile-continue", name: "Persistence, continuation and careers" },
];
function output(file: string, content: string) { files.set(file, content); }
function yaml(file: string, name: string, tags: string[], commands: Command[]) {
  output(`qa/home/maestro/${file}.yaml`, stringify({ appId, name, tags }) + "---\n" + stringify(commands));
}
const id = (value: string) => ({ id: value });
const visible = (value: string, text?: string) => ({ assertVisible: { ...id(value), ...(text === undefined ? {} : { text }) } });
const saved = () => visible("qa-save-status", "SAVED");
const scroll = (value: string, direction = "DOWN") => ({ scrollUntilVisible: { element: id(value), direction, timeout: 20000, ...(["qa-fail-save", "qa-world"].includes(value) ? { centerElement: true } : {}) } });
const tap = (value: string, direction = "DOWN"): Command[] => [scroll(value, direction), { tapOn: id(value) }];
const start: Command[] = [{ runFlow: "../helpers/start.yaml" }];
const tutorial = CHAPTERS[0].stages[0];
const git = CHAPTERS[1].stages[0];
const linux = CHAPTERS[2].stages[0];
const commonCount = CHAPTERS.flatMap((chapter) => chapter.stages).length;

yaml("helpers/start", "Check QA build and reset only QA progress", ["helper"], [
  "launchApp",
  { extendedWaitUntil: { visible: id("home-title"), timeout: 90000 } },
  ...tap("home-qa"),
  { extendedWaitUntil: { visible: { id: "qa-automation", text: "${QA_BUILD}" }, timeout: 15000 } },
  ...tap("qa-reset"), saved(), visible("qa-locale", "en"), visible("qa-captures", "0"),
]);

const battles: Record<string, unknown> = {};
async function battleCase(monster = tutorial, level = monster.level) {
  const pack = await loadMixedQuizPack(monster.quizPackId);
  const questions = drawMixedQuizQuestions(pack.questions, quizCountForLevel(level), createQaRandom());
  const value = { monsterId: monster.id, quizPackId: monster.quizPackId, level, questions };
  battles[level === 5 ? "level5" : monster === tutorial ? "tutorial" : "git"] = value;
  return value;
}
const tutorialCase = await battleCase();
await battleCase(tutorial, 5);
await battleCase(git);

function battleSteps(success: boolean, hints: boolean): Command[] {
  const commands: Command[] = [];
  let battle = createBattleState(tutorialCase.questions);
  while (battle.status === "active") {
    const q = battle.questions[battle.questionIndex];
    if (q.type === "freeText") {
      commands.push(scroll("battle-submit"), { assertVisible: { id: "battle-submit", enabled: false } });
      if (hints) {
        for (let i = 0; i < Math.min(2, q.hints?.length ?? 0); i++) {
          commands.push(...tap("battle-hint"), scroll(`battle-hint-${i + 1}`, "UP"), visible(`battle-hint-${i + 1}`));
          battle = revealBattleHint(battle, battle.questionIndex);
        }
        commands.push(scroll("battle-hint"), { assertVisible: { id: "battle-hint", enabled: false } });
      }
      commands.push(...tap("battle-answer", "UP"), { inputText: success ? q.acceptedAnswers[0] : "definitely-wrong-answer" }, ...tap("battle-submit"));
    } else {
      commands.push(...tap(`battle-choice-${success ? q.answerIndex : (q.answerIndex + 1) % q.choices.length}`));
    }
    const answer = q.type === "freeText" ? (success ? q.acceptedAnswers[0] : "definitely-wrong-answer") : success ? q.answerIndex : (q.answerIndex + 1) % q.choices.length;
    battle = submitBattleAnswer(battle, battle.questionIndex, answer);
    commands.push(scroll("battle-feedback"), visible("battle-feedback", success ? "CORRECT!" : "LET’S REVIEW"));
    if (success && hints && q.type === "freeText") commands.push(scroll("battle-damage"), visible("battle-damage", "2 hints · attack strength 50%"));
    commands.push(...tap("battle-next"));
  }
  commands.push(visible("result-title", success ? "CAPTURED" : "TRY AGAIN"));
  return commands;
}

yaml("flows/cod-235-quiz-pass", "COD-235 real mixed quiz, blank input and two hints", ["cod-235"], [
  ...start, ...tap("qa-tutorial"), ...battleSteps(true, true), ...tap("result-qa"),
  visible("qa-captures", "1"), saved(), { takeScreenshot: "cod-235-pass" },
]);
yaml("flows/cod-235-quiz-fail", "COD-235 incorrect answers do not capture", ["cod-235"], [
  ...start, ...tap("qa-tutorial"), ...battleSteps(false, false), ...tap("result-qa"),
  visible("qa-captures", "0"), saved(),
]);
yaml("flows/cod-234-capture-replay", "COD-234 battle results and duplicate capture protection", ["cod-234"], [
  ...start, ...tap("qa-tutorial"), ...battleSteps(true, false), ...tap("result-retry"),
  ...battleSteps(true, false), ...tap("result-qa"), visible("qa-captures", "1"), saved(),
  { takeScreenshot: "cod-234-replay" },
]);
yaml("flows/cod-236-recovery", "COD-236 native startup, save and quiz recovery", ["cod-236"], [
  ...start, ...tap("qa-fail-save"), ...tap("qa-retry-save"),
  scroll("qa-save-status", "UP"), saved(), visible("qa-locale", "ko"),
  ...tap("qa-fail-quiz"), ...tap("qa-tutorial", "UP"), visible("battle-load-error"),
  ...tap("battle-retry-load"), visible("battle-prompt"), ...tap("battle-exit", "UP"),
  ...tap("world-menu", "UP"), "stopApp", "launchApp",
  { extendedWaitUntil: { visible: id("home-title"), timeout: 90000 } }, ...tap("home-qa"),
  visible("qa-locale", "ko"), saved(), { takeScreenshot: "cod-236-recovery" },
]);
yaml("flows/cod-237-world-map", "COD-237 locked regions and tutorial to Git unlock", ["cod-237"], [
  ...start, ...tap("qa-world"), visible("world-title"), ...tap("world-region-linux"),
  scroll("world-battle"), { assertVisible: { id: "world-battle", enabled: false } }, visible("world-locked"),
  ...tap("world-menu", "UP"), ...tap("home-qa"), ...tap("qa-preset-tutorial"),
  scroll("qa-save-status", "UP"), saved(), visible("qa-checkpoint", git.id),
  ...tap("qa-world"), ...tap(`world-checkpoint-${git.id}`), ...tap("world-battle"), visible("battle-prompt"),
  { takeScreenshot: "cod-237-git" },
]);
yaml("flows/cod-238-continue", "COD-238 saved checkpoint survives full process restart", ["cod-238"], [
  ...start, ...tap("qa-preset-git"), scroll("qa-save-status", "UP"), saved(), visible("qa-checkpoint", linux.id),
  ...tap("qa-menu", "UP"), "stopApp", "launchApp",
  { extendedWaitUntil: { visible: id("home-title"), timeout: 90000 } }, ...tap("home-play"),
  visible("world-title"), scroll(`world-checkpoint-${linux.id}`), visible(`world-checkpoint-${linux.id}`),
  ...tap("world-menu", "UP"), ...tap("home-qa"), visible("qa-checkpoint", linux.id), saved(),
  { takeScreenshot: "cod-238-restored" },
]);

const careers = JOB_OPTIONS.map((job) => {
  const path = careerPathFor(job.id);
  const first = monstersForCareerRegion(path.regions[0].id)[0];
  yaml(`flows/cod-238-career-${job.id}`, `COD-238 ${job.id} selection and career resume`, ["cod-238", "careers"], [
    ...start, ...tap("qa-preset-complete"), scroll("qa-save-status", "UP"), saved(), visible("qa-captures", String(commonCount)),
    ...tap("qa-menu", "UP"), ...tap("home-careers"), ...tap(`career-select-${job.id}`),
    visible(`career-select-${job.id}`, "CURRENT CAREER"),
    ...tap(`career-checkpoint-${first.id}`), visible("battle-prompt"), ...tap("battle-exit", "UP"),
    visible("career-title"), ...tap("career-menu", "UP"), ...tap("home-qa"),
    visible("qa-career", job.id), saved(), ...tap("qa-menu", "UP"), "stopApp", "launchApp",
    { extendedWaitUntil: { visible: id("home-title"), timeout: 90000 } }, ...tap("home-play"),
    visible("career-title"), scroll(`career-select-${job.id}`), visible(`career-select-${job.id}`, "CURRENT CAREER"),
    { takeScreenshot: `cod-238-career-${job.id}` },
  ]);
  return { jobId: job.id, firstMonsterId: first.id, firstRegionId: path.regions[0].id };
});

output("qa/home/cases.json", JSON.stringify({ seed: HOME_QA_SEED, appId, features, battles, careers,
  nativeFlows: [...files.keys()].filter((file) => file.includes("/flows/")).map((file) => ({ file, feature: /cod-\d+/.exec(file)![0] })),
  deferred: ["Live OAuth and cross-device cloud sync require a dedicated Supabase project.", "Real IME, physical touch comfort, accessibility and device performance still need manual review."],
}, null, 2) + "\n");
for (const [file, content] of files) {
  const absolute = path.join(root, file);
  if (check) {
    if (!existsSync(absolute) || readFileSync(absolute, "utf8").replace(/\r\n/g, "\n") !== content) throw new Error(`Stale generated QA cases: ${file}. Run npm run qa:generate.`);
  } else {
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, content);
  }
}
console.log(`${check ? "Verified" : "Generated"} ${files.size} QA case files from the real game content.`);
