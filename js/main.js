/* 主控：十一章的流程。
   一章 = 漫画过场 → 玩 → 结算卡 → 下一章。

   这个文件不包含任何一章的具体内容。所有"这一章讲什么"都在 chapters.js 里，
   所有"这一章怎么动"都在 engine.js 里，这里只负责推进。 */

import { buildComic } from './comic.js';
import { createGame } from './engine.js';
import { CHAPTERS, TOTAL } from './chapters.js';
import { sfx, unlock, toggleMute, isMuted, setAmbience, setDoorProximity, applyMute } from './audio.js';

const $ = id => document.getElementById(id);

const el = {
  cover: $('cover'), start: $('btn-start'), stage: $('stage'),
  comic: $('comic'), rail: $('comic-rail'), page: $('comic-page'), skip: $('comic-skip'),
  canvas: $('game'),
  ribbon: $('ribbon'), oracleName: $('oracle-name'), oracleMode: $('oracle-mode'),
  signal: $('signal-fill'), conf: $('conf-fill'),
  speech: $('speech'), controls: $('controls'),
  hudEyebrow: $('hud-eyebrow'), levelTitle: $('level-title'),
  outro: $('outro'), outroNo: $('outro-no'), outroStat: $('outro-stat'),
  outroTitle: $('outro-title'), outroBody: $('outro-body'),
  outroName: $('outro-name'), lessonRule: $('lesson-rule'), lessonWhy: $('lesson-why'),
  next: $('btn-next'), replay: $('btn-replay'), restart: $('btn-restart'), mute: $('btn-mute')
};

/* ══════ 先知的声音 ══════
   娓娓道来的做法不是把句子写长，是**不抢**：
   一句话说完，留一段安静，再让下一句进来。所以这里有一个队列，
   而且每句的停留时间按它的字数算 —— 长句就多留一会儿。 */

let phase = 'cover';                 // cover | comic | play | outro
let game = null;                     // 当前这一章的引擎实例
let ci = 0;                          // 第几章（0 起）
let chapter = CHAPTERS[0];
let conf = 0;
let beatsLeft = [];                  // 还没说的 beats
let sayQueue = [];
let talking = false;

/* 中文按字算阅读时间：16px 一屏大约 12 字/秒，再加上一句之后必须有的停顿。
   这个停顿是"娓娓道来"的全部技术含量 —— 没有它，再温柔的词也是念稿。 */
function dwell(html) {
  const plain = html.replace(/<[^>]+>/g, '');
  return Math.min(9000, 1700 + plain.length * 190);
}

function sayNow(text, pitch = 1, d) {
  el.speech.innerHTML = text;
  el.speech.classList.add('on');
  sfx.voice(pitch);
  clearTimeout(sayNow._t);
  sayNow._t = setTimeout(() => {
    el.speech.classList.remove('on');
    talking = false;
    drain();
  }, d ?? dwell(text));
}

function say(text, pitch = 1, sticky = false) {
  if (sticky) { sayQueue.length = 0; }
  sayQueue.push({ text, pitch });
  drain();
}

function drain() {
  if (talking || !sayQueue.length) return;
  talking = true;
  const n = sayQueue.shift();
  sayNow(n.text, n.pitch);
}

function hush() {
  sayQueue.length = 0;
  clearTimeout(sayNow._t);
  talking = false;
  el.speech.classList.remove('on');
}

function setMode(name, mode) {
  el.oracleName.textContent = name;
  el.oracleMode.textContent = mode;
}

function setConf(v) {
  conf = Math.max(0, Math.min(100, v));
  el.conf.style.width = conf + '%';
}

/* ══════ beats ══════
   每一章的开场白、中途的话、结尾的话都写在章节自己身上，
   这里只负责"条件成立就说一次"。条件用帧来看，所以它不依赖计时器，
   玩家站着不动也不会漏掉任何一句话。 */

function armBeats(ch) {
  beatsLeft = (ch.beats || []).map(b => ({ ...b, done: false, at: 0 }));
}

function tickBeats(s) {
  if (!beatsLeft.length || phase !== 'play') return;
  for (const b of beatsLeft) {
    if (b.done) continue;
    if (b.when && !b.when(s)) continue;
    if (b.delay) {
      // 延迟从"条件第一次成立"开始算，不是从进关开始算
      if (!b.at) { b.at = performance.now() + b.delay; continue; }
      if (performance.now() < b.at) continue;
    }
    b.done = true;
    if (b.mode) setMode(b.mode[0], b.mode[1]);
    if (b.conf != null) setConf(b.conf);
    say(b.text, b.pitch ?? 1);
  }
  beatsLeft = beatsLeft.filter(b => !b.done || b.at > performance.now());
}

/* ══════ 引擎钩子 ══════
   引擎不认识"先知"，也不认识"章节"，它只会在合适的时候叫这几个函数。 */

function hooksFor(ch) {
  return {
    onDialogue: (text, pitch) => say(text, pitch ?? 1),
    onMode: (name, mode) => setMode(name, mode),
    onConf: setConf,

    onFall: (s, info) => {
      // 每一步摔下去都有一段自己的话。说这些话的时候不能抢在坠落音前面，
      // 所以引擎已经等了半秒 —— 这里是"人已经站回去了"的时机。
      setMode('先知', info.onFake ? '说错了' : '安静');
      setConf(Math.max(8, conf - 10));
      if (info.onFake) {
        const lines = [
          '……那里没有东西。<br><span class="waiting">我以为有。</span>',
          '又一条是假的。<br>我好像把别处的路，当成这里的了。',
          '我越来越不确定了。<br>你踩过的那条，你亲眼看过了吗？'
        ];
        say(lines[Math.min(s.trustedFake - 1, 2)] ?? lines[0], 0.8 - s.trustedFake * 0.05);
      } else {
        say('……不着急。<br><span class="waiting">底下本来就没有东西，是我没看清楚。</span>', 0.82);
      }
      el.controls.classList.remove('fade');
    },

    onReachEnd: () => enterOutro(),
  };
}

/* ══════ 流程 ══════ */

const comic = buildComic(el.comic, el.rail, el.page, () => enterGame());
el.skip.addEventListener('click', e => { e.stopPropagation(); comic.skip(); });

function loadChapter(i) {
  ci = Math.max(0, Math.min(TOTAL - 1, i));
  chapter = CHAPTERS[ci];
  hush();
  if (game) game.stop();

  game = createGame(el.canvas, chapter, hooksFor(chapter));
  game.resize();
  // 引擎实例不会自己跑起来 —— 谁建的谁负责点着。
  // 少了这一行，第一章之后的每一章都是黑屏。
  game.loop();
  window.__game = game;

  el.hudEyebrow.textContent = `第 ${chapter.no} 章 · ${chapter.title}`;
  el.levelTitle.innerHTML = chapter.hudTitle || chapter.title;
  el.controls.classList.remove('fade');
  el.ribbon.classList.add('on');
  setMode('先知', '……');
  setConf(0);
  el.signal.style.width = '0%';
  armBeats(chapter);
}

function startChapter(i) {
  loadChapter(i);
  el.stage.classList.add('behind');
  el.canvas.style.visibility = 'hidden';
  comic.set(chapter.id);
  comic.start();
  phase = 'comic';
}

function enterGame() {
  phase = 'play';
  el.stage.classList.remove('behind');
  el.canvas.style.visibility = 'visible';
  el.controls.classList.remove('fade');
  game.start();
  sfx.ping();
  // 第一句话不等 beats —— 它是"你回来了"的招呼，比所有机制都早
  const opening = chapter.opening;
  if (opening) {
    setTimeout(() => say(opening.text, opening.pitch ?? 0.86), opening.delay ?? 500);
  }
}

/* ── 结算 ──
   卡片不是"这一章结束了"，是"你现在比刚才多知道了一件什么事"。
   所以它先给数字，再给结论，最后才给那条经验 —— 顺序反了就成了说教。 */
function enterOutro() {
  phase = 'outro';
  hush();
  el.ribbon.classList.remove('on');
  el.controls.style.opacity = '0';
  setAmbience(0, false);
  setDoorProximity(0, false);

  sfx.door();
  setTimeout(() => sfx.complete(), 900);

  const s = game.state;
  const clean = s.deaths === 0;
  const last = ci >= TOTAL - 1;

  el.outroNo.textContent = chapter.no;
  el.outroName.textContent = chapter.title;

  el.outroStat.textContent = clean
    ? 'PERFECT · 一次都没摔'
    : `坠落 ${s.deaths} 次 · 但走完了`;
  el.outroStat.classList.toggle('bad', !clean);

  const out = chapter.outro ? chapter.outro(s, clean) : null;
  el.outroTitle.textContent = out?.title ?? (clean ? '你一次都没有走错。' : '你走过来了。');
  el.outroBody.innerHTML = out?.body ?? '';

  el.lessonRule.textContent = chapter.lesson.rule;
  el.lessonWhy.textContent = chapter.lesson.why;

  el.next.innerHTML = last
    ? '<span class="caret">▶</span>再看一遍这一程'
    : `<span class="caret">▶</span>下一章 · ${CHAPTERS[ci + 1].title}`;

  setTimeout(() => {
    sfx.stamp();
    el.outro.classList.add('on');
  }, 900);
}

el.next.addEventListener('click', () => {
  sfx.press();
  el.outro.classList.remove('on');
  el.controls.style.opacity = '';
  const last = ci >= TOTAL - 1;
  setTimeout(() => startChapter(last ? 0 : ci + 1), 420);
});

el.replay.addEventListener('click', () => {
  sfx.press();
  el.outro.classList.remove('on');
  el.controls.style.opacity = '';
  setTimeout(() => {
    setAmbience(0, false);
    startChapter(ci);
  }, 420);
});

for (const b of [el.next, el.replay]) {
  b.addEventListener('mouseenter', () => sfx.hover());
  b.addEventListener('focus', () => sfx.hover());
}

el.start.addEventListener('click', () => {
  unlock();
  sfx.ui();
  sfx.door();
  el.cover.classList.add('off');
  setTimeout(() => {
    el.cover.style.display = 'none';
    startChapter(0);
  }, 600);
});

el.mute.addEventListener('click', () => {
  unlock();
  const m = toggleMute();
  applyMute(m);
  el.mute.textContent = m ? '✕' : '♪';
  el.mute.title = m ? '音效已关闭' : '音效开关';
  if (!m) sfx.ui();
});

el.restart.addEventListener('click', () => location.reload());

/* ── 每帧的杂事：信号带、beats ── */
function tick() {
  if (phase === 'play' && game) {
    const s = game.state;
    tickBeats(s);
    const sig = game.signal();
    el.signal.style.width = (sig * 100).toFixed(0) + '%';
    // 环境音跟着信号走，但第三章接上工具之后会亮起来 ——
    // 那是整个游戏里唯一一次"世界因为你做了一件事而变好"
    setAmbience(sig, true, s.flags.tool ? 1 : 0);
    if (sig < 0.28 && el.ribbon.dataset.warned !== '1') {
      el.ribbon.dataset.warned = '1';
      if (s.oracleAwake) setMode('先知', '信号微弱');
    } else if (sig > 0.6) {
      el.ribbon.dataset.warned = '';
    }
  } else if (phase !== 'play') {
    setAmbience(0, false);
  }
  requestAnimationFrame(tick);
}

/* ── 启动 ──
   先把第一章装好并渲染一帧，这样封面淡出的时候背后已经有画面了，
   而不是"先看到一块黑"。 */
game = createGame(el.canvas, CHAPTERS[0], hooksFor(CHAPTERS[0]));
game.resize();
game.loop();
window.__game = game;
el.canvas.style.visibility = 'hidden';
window.addEventListener('resize', () => game.resize());
tick();

/* 调试用：直接跳章。控制台里 __jump(3) 就是第四章。 */
window.__jump = i => { el.cover.style.display = 'none'; el.cover.classList.add('off'); startChapter(i); };
window.__chapters = CHAPTERS;
