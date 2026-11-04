import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MUSIC_SCORES, MUSIC_MODES, type MusicScore, type MusicVoice } from "../packages/game-assets/src/musicScores.ts";
import "../packages/game-assets/scripts/generate-music-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = path.join(root, "packages/game-assets/files");
const reportFile = path.join(root, "qa/bgm/analysis.json");
const sampleRate = 24000;
const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const localFfmpeg = path.join(root, "qa-results/bgm-tools/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe");
const ffmpeg = process.env.FFMPEG_PATH ?? (existsSync(localFfmpeg) ? localFfmpeg : "ffmpeg");
function analyzeEncoded(file: string) {
  const decoded = spawnSync(ffmpeg, ["-v", "error", "-i", file, "-f", "f32le", "-acodec", "pcm_f32le", "-ar", String(sampleRate), "-ac", "2", "pipe:1"], { maxBuffer: 32 * 1024 * 1024, windowsHide: true });
  if (decoded.status !== 0) throw new Error(`Audio decode failed: ${decoded.stderr}`);
  const pcm = decoded.stdout; let sum = 0, peak = 0;
  for (let at = 0; at < pcm.length; at += 4) { const value = pcm.readFloatLE(at); sum += value * value; peak = Math.max(peak, Math.abs(value)); }
  return { peak, rms: Math.sqrt(sum / (pcm.length / 4)), duration: pcm.length / 8 / sampleRate,
    seamDelta: Math.max(Math.abs(pcm.readFloatLE(0) - pcm.readFloatLE(pcm.length - 8)), Math.abs(pcm.readFloatLE(4) - pcm.readFloatLE(pcm.length - 4))) };
}
if (process.argv.includes("--analyze-encoded")) {
  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  for (const track of report.tracks) track.encoded = analyzeEncoded(path.join(files, track.assetKey));
  writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
  console.log(`Decoded ${report.tracks.length} MP3 files; maximum peak ${Math.max(...report.tracks.map((t: { encoded: { peak: number } }) => t.encoded.peak)).toFixed(3)}.`);
  process.exit(0);
}
export function melodySignature(score: MusicScore) {
  const first = score.motif[0];
  return JSON.stringify([score.motif.map(n => n - first), score.rhythm.map(n => n / score.rhythm.reduce((a,b)=>a+b,0))]);
}
const signatures = new Set<string>();
for (const score of MUSIC_SCORES) {
  const signature = melodySignature(score);
  if (signatures.has(signature)) throw new Error(`Transposed/retimed duplicate melody: ${score.region}`);
  signatures.add(signature);
  if (score.motif.length !== score.rhythm.length || score.motif.length < 8 || score.rhythm.some(n => n <= 0)) throw new Error(`Invalid score: ${score.region}`);
}
if (process.argv.includes("--check")) {
  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  if (report.scoresHash !== digest(JSON.stringify(MUSIC_SCORES))) throw new Error("Music scores changed; render the soundtrack again");
  if (report.tracks.length !== MUSIC_SCORES.length) throw new Error("Missing track analysis");
  for (const track of report.tracks) {
    if (digest(readFileSync(path.join(files, track.assetKey))) !== track.sha256) throw new Error(`Changed audio: ${track.region}`);
    if (track.peak > .9 || track.rms < .025 || track.seamDelta > .001) throw new Error(`Audio QA failed: ${track.region}`);
    if (!track.encoded || track.encoded.peak > .95 || track.encoded.rms < .025 || Math.abs(track.encoded.duration - track.duration) > .1 || track.encoded.seamDelta > .08) throw new Error(`Encoded audio QA failed: ${track.region}`);
  }
  console.log(`Verified ${report.tracks.length} original scores, files, levels and loop seams.`);
  process.exit(0);
}
const out = path.join(root, "qa-results/bgm-masters");
mkdirSync(out, { recursive: true });
mkdirSync(path.dirname(reportFile), { recursive: true });
mkdirSync(path.join(files, "audio/music"), { recursive: true });

const tables = new Map<string, Float32Array>();
function table(voice: MusicVoice, midi: number) {
  const key = `${voice}:${midi}`;
  if (tables.has(key)) return tables.get(key)!;
  const frequency = 440 * 2 ** ((midi - 69) / 12), data = new Float32Array(2048);
  const harmonics = Math.min(20, Math.floor(sampleRate / 2 / frequency));
  for (let i = 0; i < data.length; i++) {
    const t = 2 * Math.PI * i / data.length;
    for (let h = 1; h <= harmonics; h++) {
      let weight = 0;
      if (voice === "pulse") weight = Math.sin(Math.PI * h * .28) / h * Math.exp(-h / 8);
      if (voice === "triangle") weight = h % 2 ? (-1) ** ((h - 1) / 2) / h ** 2 : 0;
      if (voice === "bell") weight = [0, 1, .06, .35, .02, .16, .01, .06][h] ?? 0;
      if (voice === "glass") weight = [0, 1, .22, .02, .18, .03, .08][h] ?? 0;
      if (voice === "pluck") weight = 1 / h ** 1.6;
      if (voice === "reed") weight = h % 2 ? 1 / h ** 1.3 : .025 / h;
      data[i] += Math.sin(t * h) * weight;
    }
  }
  const peak = Math.max(...data.map(Math.abs));
  for (let i = 0; i < data.length; i++) data[i] /= peak || 1;
  tables.set(key, data); return data;
}
function render(score: MusicScore) {
  const secondsPerBeat = 60 / score.bpm;
  const count = Math.round(16 * score.beats * secondsPerBeat * sampleRate);
  const left = new Float32Array(count), right = new Float32Array(count);
  const scale = MUSIC_MODES[score.mode];
  const pitch = (degree: number, octave = 0) => score.tonic + Math.floor(degree / scale.length) * 12 + scale[((degree % scale.length) + scale.length) % scale.length] + octave;
  function add(beat: number, length: number, midi: number, voice: MusicVoice, gain: number, pan: number, pad = false) {
    const start = Math.round(beat * secondsPerBeat * sampleRate);
    const held = length * secondsPerBeat, release = pad ? .18 : .055;
    const duration = held + release, wave = table(voice, midi), frequency = 440 * 2 ** ((midi - 69) / 12);
    const a = Math.sqrt((1 - pan) / 2), b = Math.sqrt((1 + pan) / 2);
    let phase = 0;
    for (let j = 0; j < duration * sampleRate; j++) {
      const t = j / sampleRate;
      const attack = Math.min(1, t / (pad ? .07 : .007));
      const tail = t > held ? Math.max(0, 1 - (t - held) / release) : 1;
      const decay = pad ? .8 : Math.exp(-t * (voice === "bell" || voice === "pluck" || voice === "glass" ? 3.2 : .65));
      const index = Math.floor(phase) % wave.length;
      const fraction = phase - Math.floor(phase);
      const value = (wave[index] * (1 - fraction) + wave[(index + 1) % wave.length] * fraction) * attack * tail * decay * gain;
      const at = (start + j) % count;
      left[at] += value * a; right[at] += value * b;
      phase += frequency * wave.length / sampleRate * (1 + .0015 * Math.sin(t * 2 * Math.PI * 5));
    }
  }
  let seed = [...score.region].reduce((a,c) => (a * 31 + c.charCodeAt(0)) >>> 0, 17);
  function drum(beat: number, kind: "kick" | "snare" | "hat", gain: number) {
    const start = Math.round(beat * secondsPerBeat * sampleRate), duration = kind === "hat" ? .04 : .16;
    let previous = 0;
    for (let j = 0; j < duration * sampleRate; j++) {
      const t = j / sampleRate;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      const high = noise - previous; previous = noise;
      const value = kind === "kick" ? Math.sin(2 * Math.PI * (48 * t + 70 * (1 - Math.exp(-t * 24)) / 24)) * Math.exp(-t * 27)
        : kind === "snare" ? (noise * .75 + Math.sin(t * Math.PI * 360) * .25) * Math.exp(-t * 25)
        : high * Math.exp(-t * 100);
      const at = (start + j) % count;
      left[at] += value * gain * .68; right[at] += value * gain * .72;
    }
  }
  for (let bar = 0; bar < 16; bar++) {
    const base = bar * score.beats, chord = score.harmony[bar % score.harmony.length];
    [0, 2, 4].forEach((n,i) => add(base + i * .04, score.beats * .85, pitch(chord + n, -12), "triangle", .052, -.5 + i * .5, true));
    for (let beat = 0; beat < score.beats; beat++) {
      const bassDegree = beat % 2 ? chord + (score.groove % 2 ? 4 : 7) : chord;
      add(base + beat + (score.groove === 5 && beat % 2 ? .13 : 0), .7, pitch(bassDegree, -24), "triangle", .15, -.15);
      if (score.groove !== 0 || bar % 2 === 0) drum(base + beat, beat === 0 || (score.beats === 4 && beat === 2) ? "kick" : "hat", .12);
      if (score.groove === 3 && beat % 2) drum(base + beat, "snare", .085);
      if ([1, 3, 4, 5].includes(score.groove)) drum(base + beat + .5, "hat", .032);
      if (bar % 4 === 3 && beat === score.beats - 1 && score.groove > 1) drum(base + beat + .75, "snare", .045);
    }
    // Quiet arpeggio is answering accompaniment, never another full lead.
    const arp = score.groove === 0 ? 2 : 4;
    for (let i = 0; i < arp; i++) add(base + i * score.beats / arp, .22, pitch(chord + [0, 2, 4, 2][i], 0), "pluck", .038, i % 2 ? .6 : -.6);
  }
  for (let phrase = 0; phrase < 8; phrase++) {
    let beat = phrase * score.beats * 2;
    const total = score.rhythm.reduce((a,b) => a+b,0);
    for (let i = 0; i < score.motif.length; i++) {
      const length = score.rhythm[i] / total * score.beats * 2;
      let degree = score.motif[i];
      if (phrase === 2 || phrase === 6) degree = score.motif[(i + 4) % score.motif.length] - 2;
      if (phrase === 5) degree = score.motif[score.motif.length - i - 1];
      if (phrase === 7 && i === score.motif.length - 1) degree = 0;
      if (!(phrase % 4 === 3 && i === 3)) add(beat, length * .78, pitch(degree), score.voice, .19, .12);
      beat += length;
    }
  }
  // Circular, finite reflections retain the release over the end/start boundary.
  for (const channel of [left, right]) {
    const dry = channel.slice();
    for (const [seconds, gain] of [[.145, .16], [.287, .09], [.431, .045]]) {
      const delay = Math.round(seconds * sampleRate);
      for (let i = 0; i < count; i++) channel[i] += dry[(i - delay + count) % count] * gain;
    }
    const seam = (channel[0] + channel[count - 1]) / 2, ramp = 120;
    for (let i = 0; i < ramp; i++) {
      const factor = .5 - .5 * Math.cos(Math.PI * i / ramp);
      channel[i] = seam + (channel[i] - seam) * factor;
      channel[count - 1 - i] = seam + (channel[count - 1 - i] - seam) * factor;
    }
  }
  let sum = 0, peak = 0;
  for (let i = 0; i < count; i++) { sum += left[i] ** 2 + right[i] ** 2; peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i])); }
  const scaleGain = Math.min(.1 / Math.sqrt(sum / (count * 2)), .79 / peak);
  const pcm = Buffer.alloc(count * 4); let finalPeak = 0, finalSum = 0;
  for (let i = 0; i < count; i++) for (let c = 0; c < 2; c++) {
    const value = (c ? right[i] : left[i]) * scaleGain;
    finalSum += value * value; finalPeak = Math.max(finalPeak, Math.abs(value));
    pcm.writeInt16LE(Math.round(value * 32767), i * 4 + c * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF"); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 4, 28);
  header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
  return { wav: Buffer.concat([header, pcm]), duration: count / sampleRate, peak: finalPeak, rms: Math.sqrt(finalSum / (count * 2)),
    seamDelta: Math.max(Math.abs(left[0]-left[count-1]), Math.abs(right[0]-right[count-1])) * scaleGain };
}
const tracks = [];
const encodeOnly = process.argv.includes("--encode-only");
const previous = encodeOnly ? JSON.parse(readFileSync(reportFile, "utf8")) : undefined;
if (previous && previous.scoresHash !== digest(JSON.stringify(MUSIC_SCORES))) throw new Error("Scores changed; render WAV masters before encoding");
for (const [index, score] of MUSIC_SCORES.entries()) {
  const wav = path.join(out, `${score.region.replaceAll(":", "--")}.wav`);
  const sound = encodeOnly ? { ...previous.tracks.find((t: { region: string }) => t.region === score.region), wav: readFileSync(wav) } : render(score);
  if (!encodeOnly) writeFileSync(wav, sound.wav);
  const target = path.join(files, score.assetKey);
  const encoding = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "48k", "-ac", "1", "-ar", "24000", "-write_xing", "1", target], { encoding: "utf8", windowsHide: true });
  if (encoding.status !== 0) throw new Error(`FFmpeg failed: ${encoding.stderr || encoding.error}`);
  const bytes = readFileSync(target);
  const analysis = { duration: sound.duration, peak: sound.peak, rms: sound.rms, seamDelta: sound.seamDelta };
  tracks.push({ region: score.region, title: score.title, assetKey: score.assetKey, bpm: score.bpm, beats: score.beats,
    voice: score.voice, mode: score.mode, ...analysis, encoded: analyzeEncoded(target), bytes: bytes.length, sha256: digest(bytes), melodySignature: melodySignature(score) });
  console.log(`${index + 1}/${MUSIC_SCORES.length}: ${score.region} (${sound.duration.toFixed(1)}s)`);
}
writeFileSync(reportFile, JSON.stringify({ version: 1, provenance: "Original authored score and local synthesis; no sampled music or external recordings.",
  sampleRate, scoresHash: digest(JSON.stringify(MUSIC_SCORES)), totalBytes: tracks.reduce((n,t)=>n+t.bytes,0), tracks }, null, 2) + "\n");
const escaped = JSON.stringify(tracks).replaceAll("<", "\\u003c");
writeFileSync(path.join(root, "qa/bgm/index.html"), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Codigdex · 지역별 BGM</title>
<style>body{margin:0;background:#19130f;color:#f1e4cb;font:16px/1.6 system-ui}main{max-width:1160px;margin:auto;padding:32px}h1{color:#efbd77}input,select{padding:12px;font:inherit;background:#f1e4cb;color:#291c13}#list{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}article{padding:18px;background:#302218;border:1px solid #99744e}h2{font-size:19px;margin:0 0 8px}small{color:#c9ad88}audio{display:block;width:100%;margin-top:14px}label{display:inline-block;margin:0 10px 22px 0}#count{margin:12px 0}</style>
<main><h1>Codigdex · 지역별 오리지널 칩튠</h1><p>지역마다 다른 선율·박자·음색을 가진 ${tracks.length}곡. 재생 버튼을 눌러 비교해 보세요. 한 번에 한 곡만 재생하며 반복 재생할 수 있습니다.</p><label>지역 검색 <input id="query" placeholder="네트워크, backend, 온실…"></label><label>분류 <select id="group"><option value="">전체</option>${["hub","common","career","secondary","promotion","mastery","source"].map(g=>`<option>${g}</option>`).join("")}</select></label><p id="count"></p><div id="list"></div></main>
<script>const tracks=${escaped};const list=document.querySelector('#list');function render(){const q=document.querySelector('#query').value.toLowerCase(),group=document.querySelector('#group').value;const filtered=tracks.filter(t=>(!group||t.region.startsWith(group+':'))&&(t.title+' '+t.region).toLowerCase().includes(q));list.replaceChildren();document.querySelector('#count').textContent=filtered.length+' / '+tracks.length+'곡';for(const t of filtered){const a=document.createElement('article'),h=document.createElement('h2'),s=document.createElement('small'),p=document.createElement('p'),audio=document.createElement('audio');h.textContent=t.title;s.textContent=t.region;p.textContent=t.bpm+' BPM · '+t.beats+'/4 · '+t.mode+' · '+t.voice+' · '+t.duration.toFixed(1)+'초';audio.controls=true;audio.loop=true;audio.preload='none';audio.src='../../packages/game-assets/files/'+t.assetKey;audio.onplay=()=>document.querySelectorAll('audio').forEach(x=>{if(x!==audio)x.pause()});a.append(h,s,p,audio);list.append(a)}}document.querySelector('#query').oninput=render;document.querySelector('#group').onchange=render;render();</script></html>`);
console.log(`Rendered ${tracks.length} tracks; ${(tracks.reduce((n,t)=>n+t.bytes,0)/1024/1024).toFixed(1)} MiB.`);
