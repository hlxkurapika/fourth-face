/* 音效：全部用 WebAudio 现场合成，不加载任何音频文件。
   理由和这个 demo 的其它部分一致 —— 纯本地、确定性、无外部资源。
   音色走"低分辨率"路线：方波 + 短噪声，和画面的大色块粗线条同一套质感。 */

let ac = null;
let master = null;
let noiseBuf = null;
let muted = false;

/* 浏览器要求首次用户手势后才能出声，所以延迟到第一次调用再建 context */
function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.34;
    master.connect(ac.destination);

    // 一段白噪声，落地/脚步/坠落都靠它
    const len = Math.floor(ac.sampleRate * 1.4);
    noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

export function unlock() { ctx(); }
export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.34;
  return muted;
}

/* ── 基础音元 ── */

/* 单个振荡器：从 f0 滑到 f1，音量按包络衰减 */
function tone({ f0, f1, type = 'square', dur = 0.12, vol = 0.3, attack = 0.004, curve = 'exp' }) {
  const a = ctx(); if (!a || muted) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(Math.max(1, f0), t);
  if (f1 && f1 !== f0) {
    if (curve === 'exp') o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    else o.frequency.linearRampToValueAtTime(Math.max(1, f1), t + dur);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

/* 一段噪声：带通/低通塑形，用来做脚步、落地、坠落风声 */
function noise({ dur = 0.1, vol = 0.3, hp = 0, lp = 12000, q = 1, sweepTo = null }) {
  const a = ctx(); if (!a || muted) return;
  const t = a.currentTime;
  const s = a.createBufferSource();
  s.buffer = noiseBuf;
  const f = a.createBiquadFilter();
  f.type = lp < 12000 && hp > 0 ? 'bandpass' : (hp > 0 ? 'highpass' : 'lowpass');
  f.frequency.setValueAtTime(hp || lp, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t + dur);
  f.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t); s.stop(t + dur + 0.02);
}

/* 和弦：一次响几个音，收尾用 */
function chord(freqs, { dur = 0.9, vol = 0.16, type = 'triangle', gap = 0.06 } = {}) {
  freqs.forEach((f, i) => {
    setTimeout(() => tone({ f0: f, f1: f, type, dur, vol, attack: 0.02, curve: 'lin' }), i * gap * 1000);
  });
}

/* ── 环境层 ──
   一条常驻的低频嗡嗡，音高和音量跟着"先知离你多远"走。
   这是整个章节唯一一直在响的声音 —— 玩家不会意识到它在响，
   但信号一弱，耳朵会先发现。

   它必须在第一次用户手势之后才能起，所以由 unlock() 拉起来。 */
let amb = null;          // { osc, sub, pad, filt, g, lfo, breath }
let ambTarget = 0.14;    // 目标音量，由 setAmbience 推
let doorDrone = null;    // 靠近门时叠上去的一层

/* 第三章接上工具之后会切到"看得见"的和声：一个属九度挂留，
   不解决、不推进，只是悬在那里 —— 治愈感的来源是"不催你"。 */
let ambBright = 0;

export function setAmbience(sig, on = true, bright = null) {
  const a = ctx(); if (!a) return;
  if (!on) { ambTarget = 0; }
  else ambTarget = 0.045 + sig * 0.11;      // 比原来轻一档：底噪是垫子，不是主体
  if (bright != null) ambBright = bright;

  if (!amb) {
    const osc = a.createOscillator();       // 主嗡鸣
    const sub = a.createOscillator();       // 低八度，给一点体积
    const pad = a.createOscillator();       // 高处的一层薄光
    const filt = a.createBiquadFilter();
    const g = a.createGain();
    const padG = a.createGain();
    const lfo = a.createOscillator();       // 极慢的抖动，像"不稳的信号"
    const lfoGain = a.createGain();
    const breath = a.createOscillator();    // 4 秒一次的呼吸，垫子在轻轻起伏
    const breathGain = a.createGain();

    // D 大调的空五度：D2 + A2 + F#4。没有三度，所以既不亮也不暗，
    // 像一间开着窗的空屋子 —— 这是"治愈"和"冷清"之间那条很细的线。
    osc.type = 'sine'; osc.frequency.value = 73.4;
    sub.type = 'triangle'; sub.frequency.value = 36.7;
    pad.type = 'sine'; pad.frequency.value = 370;      // F#4
    filt.type = 'lowpass'; filt.frequency.value = 420; filt.Q.value = 1.8;
    g.gain.value = 0.0001;
    padG.gain.value = 0.0001;

    lfo.type = 'sine'; lfo.frequency.value = 0.11;
    lfoGain.gain.value = 0.008;

    breath.type = 'sine'; breath.frequency.value = 0.24;   // ≈4.2 秒一次
    breathGain.gain.value = 0.014;

    osc.connect(filt); sub.connect(filt); filt.connect(g);
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    breath.connect(breathGain); breathGain.connect(g.gain);
    pad.connect(padG); padG.connect(master);
    osc.start(); sub.start(); pad.start(); lfo.start(); breath.start();
    amb = { osc, sub, pad, padG, filt, g, lfo, breath };
  }

  // 平滑推向目标，避免走近/走远时"啪"地跳一下
  const t = a.currentTime;
  amb.g.gain.cancelScheduledValues(t);
  amb.g.gain.setTargetAtTime(muted ? 0 : ambTarget, t, 0.9);

  // 信号弱 → 音色也闷下去，和那副"听不清"的语气对上。
  // 但下限抬高了：闷是闷，不刺耳。
  amb.filt.frequency.setTargetAtTime(300 + sig * 420, t, 0.9);
  amb.osc.frequency.setTargetAtTime(71 + sig * 5, t, 0.9);

  // 那层薄光跟着"它现在有多确定"走，跟着 bright 慢慢亮起来
  amb.padG.gain.setTargetAtTime(
    muted ? 0 : (0.0035 + ambBright * 0.020) * (0.35 + sig * 0.65), t, 1.2);
}

/* 靠近门：叠一层缓慢上行的持续音，越近越亮、越响 */
export function setDoorProximity(p, on = true) {
  const a = ctx(); if (!a) return;
  const amt = on ? Math.max(0, Math.min(1, p)) : 0;

  if (!doorDrone && amt > 0) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = 'sine';                       // 原来是 triangle，泛音太多，走起来吵
    osc.frequency.value = 147;               // D3，和垫子同一个调
    g.gain.value = 0.0001;
    osc.connect(g); g.connect(master);
    osc.start();
    doorDrone = { osc, g };
  }
  if (!doorDrone) return;

  const t = a.currentTime;
  doorDrone.g.gain.cancelScheduledValues(t);
  doorDrone.g.gain.setTargetAtTime(muted ? 0 : amt * 0.042, t, 0.45);
  doorDrone.osc.frequency.setTargetAtTime(147 + amt * 44, t, 0.45);
}

/* ── 音效表 ── */

export const sfx = {
  /* 起跳：短促上扬，方波，复古手感 */
  jump() { tone({ f0: 320, f1: 620, dur: 0.10, vol: 0.22, type: 'square' }); },

  /* 落地：低频闷响 + 一点噪声，越重越响 */
  land(power = 1) {
    const p = Math.max(0.25, Math.min(1, power));
    tone({ f0: 150 * p + 60, f1: 46, dur: 0.13, vol: 0.20 * p, type: 'triangle' });
    noise({ dur: 0.07, vol: 0.13 * p, lp: 900, q: 0.7 });
  },

  /* 脚步：左右脚交替、音高微抖 —— 单音重复会立刻暴露"这是循环播放" */
  step(alt = 1) {
    const jitter = 0.94 + Math.random() * 0.12;
    noise({ dur: 0.038, vol: 0.045 + Math.random() * 0.015, hp: (alt > 0 ? 860 : 700) * jitter, lp: 4200 * jitter, q: 0.8 });
    tone({ f0: (alt > 0 ? 128 : 96) * jitter, f1: 70, dur: 0.04, vol: 0.030, type: 'sine', attack: 0.002 });
  },

  /* 起跳的尾音：真正落地前的那一声"离地"，比 jump 更轻 */
  liftoff() { noise({ dur: 0.10, vol: 0.06, hp: 1600, lp: 6000, q: 0.7 }); },

  /* 坠落：一路下滑的风声 + 下坠音。
     这一版把音量压了一半 —— 摔下去这件事本身已经是惩罚了，
     耳朵不需要再被刮一下。（"失败要温柔"，第一步就是不吓人。） */
  fall() {
    tone({ f0: 330, f1: 74, dur: 0.9, vol: 0.13, type: 'triangle' });
    noise({ dur: 0.85, vol: 0.09, hp: 2400, sweepTo: 220, q: 0.5 });
  },

  /* 踩到不存在的路：一声"这里什么都没有"的空响 */
  void() {
    tone({ f0: 168, f1: 62, dur: 0.55, vol: 0.13, type: 'sine', attack: 0.01 });
    noise({ dur: 0.4, vol: 0.06, lp: 520, q: 0.4 });
  },

  /* 一脚踩空的那一瞬：比 void 更尖、更短。
     这是玩家"意识到先知看错了"的那个音，要抢在坠落音之前响。
     不刺，但一定要先到 —— 它是理解，不是惩罚。 */
  misstep() {
    tone({ f0: 740, f1: 280, dur: 0.15, vol: 0.10, type: 'triangle', curve: 'exp' });
    noise({ dur: 0.10, vol: 0.055, hp: 2000, q: 1.0 });
  },

  /* 假路露馅：先知那层镀光当众失效，一声走调的滑音。
     从 sawtooth 换成 sine + 一个错开的五度 —— 还是"不对"，
     但不是电子故障，是嗓子突然哑了一下。 */
  glitch() {
    tone({ f0: 466, f1: 138, dur: 0.40, vol: 0.10, type: 'sine', attack: 0.01 });
    setTimeout(() => tone({ f0: 311, f1: 104, dur: 0.36, vol: 0.07, type: 'sine', attack: 0.01 }), 105);
    noise({ dur: 0.3, vol: 0.045, hp: 1400, sweepTo: 320, q: 0.8 });
  },

  /* 镜片/先知回应：清脆的双音，像玻璃轻碰 */
  ping() {
    tone({ f0: 1180, f1: 1180, dur: 0.14, vol: 0.14, type: 'triangle', attack: 0.001 });
    setTimeout(() => tone({ f0: 1760, f1: 1760, dur: 0.22, vol: 0.10, type: 'triangle' }), 70);
  },

  /* 碰响：比 ping 软、比 tick 长。
     第二章每踩实一块石头、第三章装上工具、第五章取起石板都用它 ——
     整个游戏里"你做对了一件事"的正反馈就只有这一个音，
     所以它不能像街机加分，得像有人在你身后轻轻应了一声。 */
  chime() {
    [[659, 0.45, 0.075], [880, 0.55, 0.058], [1174, 0.75, 0.036]].forEach(([f, d, v], i) => {
      setTimeout(() => tone({ f0: f, f1: f, dur: d, vol: v, type: 'sine', attack: 0.035, curve: 'lin' }), i * 55);
    });
  },

  /* 一整段路走完了：三个音的短句，收在一个不会让人紧张的上行三度上。
     和 complete() 分开 —— complete 是"这一章结束了"，
     chimeLine 是"你刚才那一路，我都在看着"。 */
  chimeLine() {
    [[523, 0.5], [784, 0.5], [1046, 0.9]].forEach(([f, d], i) => {
      setTimeout(() => tone({ f0: f, f1: f, dur: d, vol: 0.062, type: 'sine', attack: 0.05, curve: 'lin' }), i * 210);
    });
  },

  /* 先知"说话"：低低的嗡一声，每句话的开头都响 */
  voice(pitch = 1) {
    tone({ f0: 210 * pitch, f1: 168 * pitch, dur: 0.26, vol: 0.11, type: 'sine', attack: 0.03 });
    tone({ f0: 316 * pitch, f1: 250 * pitch, dur: 0.20, vol: 0.05, type: 'sine', attack: 0.04 });
  },

  /* 唤醒先知：自下而上的扫频 + 和弦，这一章最重要的一个音 */
  wake() {
    tone({ f0: 90, f1: 640, dur: 0.75, vol: 0.20, type: 'triangle', attack: 0.02 });
    chord([392, 523, 659], { dur: 1.2, vol: 0.10, type: 'sine' });
  },

  /* 信号衰减：先知的音变闷、变远。
     不再是"下滑"，是"退远"—— 音低一点、尾长一点，像有人在走廊那头说话。 */
  decay() {
    tone({ f0: 262, f1: 174, dur: 0.75, vol: 0.085, type: 'sine', attack: 0.06, curve: 'lin' });
    noise({ dur: 0.6, vol: 0.04, lp: 620, sweepTo: 200, q: 0.5 });
  },

  /* 门：低频轰鸣 + 一束亮音，走向出口 */
  door() {
    tone({ f0: 70, f1: 58, dur: 1.6, vol: 0.22, type: 'sawtooth', attack: 0.3 });
    noise({ dur: 1.4, vol: 0.10, lp: 1400, sweepTo: 400, q: 0.5 });
    setTimeout(() => chord([523, 659, 784, 1047], { dur: 1.5, vol: 0.09, type: 'sine', gap: 0.09 }), 260);
  },

  /* 章节收尾：沉稳的终止和弦 */
  complete() {
    chord([261, 392, 523], { dur: 2.2, vol: 0.15, type: 'sine', gap: 0.13 });
    setTimeout(() => chord([330, 494, 659], { dur: 1.8, vol: 0.10, type: 'sine', gap: 0.1 }), 340);
  },

  /* 结算卡：印章落下的那一击 —— 短促的低频撞击 + 尾随的金属余音 */
  stamp() {
    tone({ f0: 220, f1: 44, dur: 0.20, vol: 0.26, type: 'square', attack: 0.001 });
    noise({ dur: 0.12, vol: 0.16, lp: 1800, q: 0.6 });
    setTimeout(() => tone({ f0: 1568, f1: 1568, dur: 0.30, vol: 0.055, type: 'triangle', attack: 0.002 }), 60);
  },

  /* 结算卡上的统计逐条弹出：极轻的一滴 */
  tick() { tone({ f0: 1320, f1: 1320, dur: 0.035, vol: 0.06, type: 'square' }); },

  /* 章节号大字推进：一声沉甸甸的推移 */
  slide() {
    noise({ dur: 0.28, vol: 0.09, lp: 2400, sweepTo: 500, q: 0.6 });
    tone({ f0: 96, f1: 72, dur: 0.26, vol: 0.10, type: 'triangle', attack: 0.01 });
  },

  /* 按钮悬停 / 按下 */
  hover() { tone({ f0: 1046, f1: 1046, dur: 0.03, vol: 0.045, type: 'square' }); },
  press() {
    tone({ f0: 660, f1: 440, dur: 0.07, vol: 0.14, type: 'square' });
    noise({ dur: 0.05, vol: 0.07, lp: 3000, q: 0.7 });
  },

  /* UI：确认 / 翻页 */
  ui() { tone({ f0: 880, f1: 880, dur: 0.055, vol: 0.12, type: 'square' }); },
  uiBack() { tone({ f0: 440, f1: 330, dur: 0.08, vol: 0.12, type: 'square' }); },
};

/* 静音切换时，环境层也要跟着停 —— 它是常驻的，不归 master 的那次赋值管 */
export function applyMute(m) {
  if (!amb) return;
  const a = ctx(); if (!a) return;
  amb.g.gain.setTargetAtTime(m ? 0 : ambTarget, a.currentTime, 0.12);
  amb.padG.gain.setTargetAtTime(m ? 0 : (0.0035 + ambBright * 0.020), a.currentTime, 0.12);
  if (doorDrone) doorDrone.g.gain.setTargetAtTime(0, a.currentTime, 0.12);
}
