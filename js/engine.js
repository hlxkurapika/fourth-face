/* 横版引擎 · 通用
   内部低分辨率 (520x360) 放大渲染 —— 锐利的大色块与粗线条。

   引擎只负责"物理 + 画世界"，不掺任何章节逻辑。
   每一章是一份数据（平台 / 幽灵台 / 道具 / 盲区）加几个钩子
   （onFrame / onInteract / onFall / onReach）。

   为什么要分开：十一章各有一个"只能用身体学到"的机制，
   如果每章复制一份引擎，序章调好的手感（起跳余量、台阶辅助、
   落地音的分档）就得再调十遍，而且会越调越歪。 */

import { sfx, setDoorProximity } from './audio.js';

export const H = 360;

const GRAV = 0.62;
const MOVE = 0.55;
const FRICTION = 0.78;
const JUMP = -11.6;
const MAX_FALL = 12;
const STEP_UP = 12;

const W_BOX = 20, H_BOX = 30;
const ROUTE_GRAB = 30;   // 离标记路多近才算"你是沿着它走的"

/* ── 调色板 ──
   冷灰蓝打底，骨白压边，唯一那点亮色留给"先知给的东西"。

   三档青是刻意的：越远越淡、越蓝，中间隔着空气。空洞骑士那种纵深
   不是靠画得细，是靠这几层几乎是同一个颜色、但差一点点。
   写成一个对象是因为这些值互相之间要说得上话 —— 改天要调冷暖，
   在散落各处的 40 个十六进制里改，一定会改漏。 */
export const PAL = {
  ink: '#0b0f12',        // 最深的底
  ink2: '#11171c',       // 远景剪影
  ink3: '#182028',       // 中景
  stone: '#9fb0b8',      // 台面顶面（骨白偏冷）
  stoneWarm: '#7d8c94',  // 台面侧壁
  body: '#c3d2d8',       // 角色
  paper: '#dfe7e9',      // 文字/描边
  line: '#070a0c',       // 轮廓
  glow: '#8fd4e8',       // 先知的信号：冷青
  pale: '#b6d8e4',       // 更淡的青，用于远处的门与光
  deep: '#1d2830',       // 台面侧壁 / 中景块
  deep2: '#26343d',      // 侧壁受光的一侧
  mute: '#3d4d57',       // 未点亮的机关
  mute2: '#5a6c76',      // 已见过但未激活
  amber: '#e8d4a8',      // 唯一一处暖色：道具、灯
  bad: '#c4553f',        // 摔下去的那一下
};

/* 半透明的写法全走这里，这样上面那个对象是唯一的颜色来源。
   十六进制在 canvas 里不能带 alpha，所以拆开拼。 */
function rgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

const rnd = (a, b) => a + Math.random() * (b - a);

export function createGame(canvas, chapter, hooks = {}) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const world = chapter.world;
  const VW = world.viewW || 520;
  const KILL_Y = world.killY ?? H + 90;

  /* 一局一个实例。切章的时候上一个实例必须彻底停下 ——
     否则它那条 requestAnimationFrame 链会一直画下去，
     七个引擎抢同一张 canvas，画面就是它们互相盖。 */
  let alive = true;

  /* 活着的平台表：除了关卡本身的台面，章节逻辑还可以随时增删
     （比如第四章的记忆闸门 —— 关着的时候就是一堵墙）。
     碰撞只认这张表。
     它得在 floorUnder 之前就位 —— 门的高度是从平台表里查出来的。 */
  let plats = world.platforms.map(p => ({ ...p }));

  /* 门的几何。第一章是一道立在地上的方形门洞；终章是一道拱门 ——
     形状不同，但"走进去就算到了"这件事是一样的，所以两者共用一套触发。

     门站在哪一层？从平台表里查，而不是每章手写一遍：站台是 h>30 的厚实
     地面，门就立在上面。触发器要求玩家大致在这一层（±60），
     所以"从高处飘过去"不算走到门口 —— 门是要用脚进的。

     door 是 let 而不是 const：终章本来没有门，门是在你走到尽头之后
     才出现的，而且出现在你身后。这一处"世界可以被改写"必须落在引擎里。 */
  function floorUnder(x) {
    const p = plats.find(q => x >= q.x && x <= q.x + q.w && q.h > 30);
    return p ? p.y : H;
  }

  let door = world.doorX == null ? null : {
    x: world.doorX,
    style: world.doorStyle || 'slab',
    floor: floorUnder(world.doorX),
    active: world.doorAtStart !== false,
  };

  /** 终章用：把门挪到别处再让它出现 */
  function setDoor(x, style) {
    door = { x, style: style || door?.style || 'slab', floor: floorUnder(x), active: true };
  }

  const state = {
    px: world.spawn.x, py: world.spawn.y, vx: 0, vy: 0,
    onGround: false, face: 1,
    jumping: false,
    foot: 1,
    still: 0,               // 站着不动的帧数：先知会挑这个时候开口
    camX: 0,
    running: false,
    dead: false,
    deaths: 0,
    t: 0,
    // 先知
    oracleAwake: false,
    route: null,
    routeRevealed: false,
    trustedFake: 0,
    reachedEnd: false,
    particles: [],
    rings: [],              // 按 E 的那一下：一圈扩散，证明这个键是活的
    tip: null,              // 头顶的一行小字，回答"这一下按了有什么用"
    launch: null,           // 章节抛出的一次固定轨迹（技能跳）
    capOverride: null,      // 章节临时抬高/压低最高速度
    shake: 0,
    flags: {},              // 章节自己的状态，引擎不解释
    // 章节机制的通用量
    lit: new Set(),         // 已点亮的区域/灯
    seen: new Set(),        // 已接触过的道具
  };

  chapter.init?.(state);

  /* ── 输入 ──
     手动和自动（第六章：先知自己开）共用同一组输入量。 */
  const keys = new Set();
  const input = { left: false, right: false, jump: false };
  let autoDrive = false;

  const onKey = (e, down) => {
    const k = e.key.toLowerCase();
    if (['a', 'd', 'w', ' ', 'e', 'r', 'arrowleft', 'arrowright', 'arrowup'].includes(k)) e.preventDefault();
    if (down) {
      /* E 交给引擎自己分发：先看脚边有没有道具，有就把这一下给道具，
         没有才当作"对着空气按下 E"。从前这里叫的是 hooks.onConfirm，
         而主程序根本没定义那个钩子，所以这个键一直是死的。 */
      if (!keys.has(k) && k === 'e') api.confirm();
      if (!keys.has(k) && k === 'r') reset(false);
      keys.add(k);
    } else keys.delete(k);
  };
  window.addEventListener('keydown', e => onKey(e, true));
  window.addEventListener('keyup', e => onKey(e, false));
  window.addEventListener('blur', () => keys.clear());

  /* ── 物理 ── */
  function boxAt(nx, ny) {
    return { x: nx - W_BOX / 2, y: ny - H_BOX, w: W_BOX, h: H_BOX };
  }

  function collide(nx, ny) {
    const box = boxAt(nx, ny);
    for (const p of plats) {
      if (box.x < p.x + p.w && box.x + box.w > p.x &&
          box.y < p.y + p.h && box.y + box.h > p.y) {
        return { p, box };
      }
    }
    return null;
  }

  /* ── 先知标记的通路（只有第一章用，但引擎得会画） ── */
  const ROUTES = chapter.routes || [];
  let onRoute = null;
  let wasGround = true;

  function nearestRoute(x, y) {
    let best = null, bd = Infinity;
    for (const r of ROUTES) {
      for (let i = 0; i < r.points.length - 1; i++) {
        const a = r.points[i], b = r.points[i + 1];
        const lo = Math.min(a.x, b.x) - 14, hi = Math.max(a.x, b.x) + 14;
        if (x < lo || x > hi) continue;
        const t = Math.max(0, Math.min(1, (x - a.x) / (b.x - a.x || 1)));
        const ly = a.y + (b.y - a.y) * t;
        const d = Math.abs(y - ly);
        if (d < bd) { bd = d; best = r; }
      }
    }
    return { route: best, dist: bd };
  }

  /* ── 步骤 ── */
  function step() {
    if (!state.running) { chapter.onIdle?.(state, api); return; }
    state.t++;
    if (state.onGround && Math.abs(state.vx) < 0.3) state.still = (state.still || 0) + 1;
    else state.still = 0;

    const left  = autoDrive ? input.left  : (keys.has('a') || keys.has('arrowleft'));
    const right = autoDrive ? input.right : (keys.has('d') || keys.has('arrowright'));
    const jump  = autoDrive ? input.jump  : (keys.has('w') || keys.has(' ') || keys.has('arrowup'));

    const speed = chapter.moveSpeed ?? MOVE;
    if (left) { state.vx -= speed; state.face = -1; }
    if (right) { state.vx += speed; state.face = 1; }
    if (!left && !right) state.vx *= FRICTION;
    // 技能跳：这条抛物线的水平速度是章节写死的，玩家的加减速不参与
    if (state.launch) state.vx = state.launch.vx;
    const cap = state.capOverride ?? chapter.maxSpeed ?? 3.6;
    state.vx = Math.max(-cap, Math.min(cap, state.vx));

    if (jump && state.onGround) {
      state.vy = chapter.jumpPower ?? JUMP;
      state.onGround = false;
      state.jumping = true;
      state.shake = 3;
      puff(state.px, state.py, 5);
      sfx.jump();
      sfx.liftoff();
    }

    state.vy = Math.min(MAX_FALL, state.vy + GRAV);

    // X 轴（带台阶辅助：不超过 STEP_UP 的坎自动抬脚迈上去）
    const nx = state.px + state.vx;
    const hitX = collide(nx, state.py);
    if (hitX) {
      const rise = state.py - hitX.p.y;
      const stepUp = chapter.stepUp ?? STEP_UP;
      if (state.onGround && rise > 0 && rise <= stepUp) {
        state.py = hitX.p.y;
        state.px = nx;
      } else {
        state.vx = 0;
        chapter.onBump?.(state, api, hitX.p);
      }
    } else state.px = nx;

    // Y 轴
    const ny = state.py + state.vy;
    const hit = collide(state.px, ny);
    if (hit) {
      if (state.vy > 0) {
        state.py = hit.p.y;
        state.onGround = true;
        state.jumping = false;
        state.launch = null;
        state.capOverride = null;
        if (state.vy > 6) {
          state.shake = Math.min(6, state.vy * .5);
          puff(state.px, state.py, 4);
          sfx.land(state.vy / MAX_FALL);
        } else if (state.vy > 2.2) {
          sfx.land(0.45);
        }
      } else {
        state.py = hit.p.y + hit.p.h + H_BOX;
        state.jumping = false;
      }
      state.vy = 0;
    } else {
      state.py = ny;
      if (state.onGround && state.vy > 1.5) {
        // 主动起跳 vs 脚下那块地不在了 —— 两个音要分得开：
        // 前者是"我决定走"，后者是"先知看错了"。
        if (state.jumping) sfx.void();
        else { sfx.misstep(); sfx.void(); }
        state.shake = 4;
      }
      state.onGround = false;
    }

    /* 追踪"这一次滞空里，我离先知标的路最近到过多少"。
       不能只看摔死那一帧 —— 那时人已经掉到画面外了，离哪条路都远。
       玩家是"穿"过那条路掉下去的，所以要记住整个滞空期间的最近距离。 */
    if (state.onGround) {
      wasGround = true;
    } else if (wasGround) {
      wasGround = false;
      onRoute = state.routeRevealed ? nearestRoute(state.px, state.py) : null;
    } else if (state.routeRevealed) {
      const n = nearestRoute(state.px, state.py);
      if (n.route && (!onRoute || !onRoute.route || n.dist < onRoute.dist)) onRoute = n;
    }

    // 坠落
    if (state.py > KILL_Y) {
      sfx.fall();
      fall();
      return;
    }

    // 到终点
    if (!state.reachedEnd && door?.active &&
        state.px > door.x - 46 && Math.abs(state.py - door.floor) < 70) {
      state.reachedEnd = true;
      state.running = false;
      hooks.onReachEnd?.();
      return;
    }

    // 门越来越近
    if (door?.active) {
      if (state.px > door.x - 480 && state.t % 90 === 0) sfx.ping();
      setDoorProximity(Math.max(0, (state.px - (door.x - 460)) / 460));
    }

    // 相机跟随
    const target = Math.max(0, Math.min(state.px - VW * 0.40, Math.max(0, (world.levelW || world.doorX + 200) - VW)));
    state.camX += (target - state.camX) * 0.11;

    // 粒子
    state.particles = state.particles.filter(pt => (pt.life -= 1) > 0);
    state.particles.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.3; });
    // 按下 E 的那圈光：约 24 帧走完，比一句话快得多
    state.rings = state.rings.filter(r => (r.life -= 1) > 0);
    if (state.tip && (state.tip.life -= 1) <= 0) state.tip = null;
    if (state.shake > 0) state.shake *= 0.82;

    // 脚步
    const walking = state.onGround && Math.abs(state.vx) > 0.7;
    if (walking && state.t % 9 === 0) {
      state.foot = -state.foot;
      sfx.step(state.foot);
    }

    chapter.onFrame?.(state, api);
  }

  function puff(x, y, n) {
    for (let i = 0; i < n; i++) {
      state.particles.push({
        x, y, vx: rnd(-1.3, 1.3), vy: -Math.random() * 2.2,
        life: 16 + Math.random() * 12, r: 1 + Math.random() * 1.8
      });
    }
  }

  function fall() {
    state.dead = true;
    state.deaths++;
    state.running = false;
    state.jumping = false;
    const info = {
      onRoute,
      onFake: !!(onRoute && onRoute.route && !onRoute.route.real && onRoute.dist <= ROUTE_GRAB),
    };
    if (info.onFake) state.trustedFake = Math.min(3, state.trustedFake + 1);

    // 章节可以先接管这次坠落（第六章：先知自己爬起来，不用玩家管）
    if (chapter.onFall?.(state, api, info)) return;

    sfx.glitch();
    const back = (world.checkpoint && state.px > world.checkpoint.after)
      ? world.checkpoint : world.spawn;
    setTimeout(() => {
      reset(true, back);
      hooks.onFall?.(state, info);
    }, 520);
  }

  function reset(keepRoute, at) {
    const p = at || world.spawn;
    state.px = p.x; state.py = p.y;
    state.vx = 0; state.vy = 0;
    state.jumping = false;
    state.camX = Math.max(0, p.x - VW * 0.40);
    state.dead = false;
    state.reachedEnd = false;
    state.particles = [];
    state.rings = [];
    state.tip = null;
    state.launch = null;
    state.capOverride = null;
    state.shake = 0;
    if (!keepRoute) { state.route = null; state.routeRevealed = false; }
    state.running = true;
  }

  /* ── 道具 ──
     第 5 章的石头把"我能跨多远"写成参数，玩家得先把那块石头拿在手里，
     所以它的判定范围就是它自己的 reach，比默认的 34 大得多。
     默认值给 34 是因为耳朵/肩膀要够得着，不是脚尖够得着。 */
  function propReach(p) {
    if (p.reach) return p.reach;
    return (p.w ? p.w / 2 : 0) + 34;
  }

  function nearestProp() {
    let best = null, bd = Infinity;
    for (const p of world.props || []) {
      if (p.gate && !p.gate(state)) continue;
      if (p.auto) continue;                      // 碰上就亮的灯，不用按 E
      const dx = Math.abs(state.px - p.x);
      const dy = Math.abs(state.py - (p.y ?? state.py));
      if (dx <= propReach(p) && dy <= 56 && dy < bd) { bd = dy; best = p; }
    }
    return best;
  }

  /* ── 绘制 ──
     画面本身是按 520×360 画的，但离屏缓冲不该也只有 520×360 ——
     那样放大到窗口上，一根 1.5px 的描边会被撑成几像素宽的大色块，
     所有细节都糊成一片。所以离屏缓冲按真实窗口比例开得更大，
     画的时候整体缩放到那个密度上（下面用 setTransform 铺一次），
     最后再平滑地缩回窗口大小。代码里所有坐标仍然是 520×360 的。 */
  const off = document.createElement('canvas');
  const g = off.getContext('2d');

  /* 离屏密度：向窗口的物理像素看齐，但不低于 2 倍，也不超过 3 倍
     （再高只是白烧 GPU，线条该多细已经细到位了）。 */
  function superScale() {
    const need = Math.max(canvas.width / VW, canvas.height / H);
    return Math.max(2, Math.min(3, need));
  }
  let SS = superScale();

  /* 尘埃。空洞骑士的空气里一直有东西在慢慢飘 —— 它不是特效，
     是"这里有高度、有风、有年头"的唯一线索。固定吃固定吹，
     所以每个像素的走向都一样，不会有随机的噪声感。 */
  function mote(i) {
    const s = i * 7919;
    return {
      x: ((s % 977) / 977) * VW,
      y: ((s % 613) / 613) * H,
      r: 1 + (s % 3) * 0.5,
      sp: 0.12 + (s % 5) * 0.05,
      ph: s % 100,
    };
  }

  function drawMotes() {
    g.save();
    for (let i = 0; i < 46; i++) {
      const m = mote(i);
      // 自己往下飘一点、往右飘一点，再用正弦绕个圈
      const y = (m.y + state.t * m.sp) % H;
      const x = (m.x + state.t * m.sp * 0.35 +
                 Math.sin((state.t * 0.008) + m.ph) * 3.5) % VW;
      const a = 0.10 + 0.14 * (1 - y / H);       // 越靠上越淡：远处
      g.globalAlpha = a;
      g.fillStyle = PAL.pale;
      g.fillRect(x | 0, y | 0, m.r, m.r);
    }
    g.restore();
  }

  function bg() {
    const pal = chapter.palette || {};
    const sky = pal.sky || PAL.ink;

    // 天空：上深下浅，让"底"看起来是有重量的
    const skyGrad = g.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, PAL.ink);
    skyGrad.addColorStop(0.62, sky);
    skyGrad.addColorStop(1, PAL.ink2);
    g.fillStyle = skyGrad;
    g.fillRect(0, 0, VW, H);

    /* 远景：一片塔。只有轮廓，没有细节 —— 细节会把它们拉到眼前来，
       而它们该待的地方是那层雾里。 */
    const p1 = -state.camX * 0.13;
    for (let i = 0; i < 20; i++) {
      const s = (i * 97) % 100;
      const x = p1 + i * 108 - 120;
      const wdt = 40 + (s % 6) * 26;
      const hgt = 150 + (s % 9) * 40;
      const top = H - hgt;

      g.fillStyle = i % 2 ? PAL.ink2 : PAL.ink3;
      g.fillRect(x, top, wdt, hgt);

      // 顶尖：一条细的、收上去的线，塔的重量都在这里
      g.beginPath();
      g.moveTo(x + wdt * 0.28, top);
      g.lineTo(x + wdt * 0.5, top - 14 - (s % 4) * 6);
      g.lineTo(x + wdt * 0.72, top);
      g.closePath();
      g.fill();

      // 窗：只有几扇还亮着，而且是暖的 —— 冷底子上唯一的暖
      g.fillStyle = rgba(PAL.amber, .13);
      for (let wy = top + 20; wy < H - 30; wy += 26) {
        for (let wx = x + 8; wx < x + wdt - 10; wx += 15) {
          if ((wx * 7 + wy * 3 + i) % 11 < 2) g.fillRect(wx, wy, 4, 6);
        }
      }
    }

    // 中景：悬空的碎块，比远景更冷更近，边缘硬
    const p2 = -state.camX * 0.42;
    for (let i = 0; i < 14; i++) {
      const x = p2 + i * 130 - 70;
      const y = 66 + ((i * 67) % 140);
      g.fillStyle = PAL.deep;
      g.fillRect(x, y, 52, 20);
      g.fillStyle = PAL.deep2;
      g.fillRect(x + 52, y, 11, 20);
      g.fillStyle = PAL.mute;
      g.fillRect(x, y, 52, 2.5);          // 顶面一道极淡的受光边
    }

    // 地平线以下的一层积雾：把远处的塔和近处的台面接在一起
    const haze = g.createLinearGradient(0, H * .30, 0, H);
    haze.addColorStop(0, rgba(PAL.ink, 0));
    haze.addColorStop(0.55, rgba(PAL.ink, .42));
    haze.addColorStop(1, rgba(PAL.ink, .86));
    g.fillStyle = haze;
    g.fillRect(0, 0, VW, H);

    drawMotes();
  }

  /* 一块台面。ghost = 先知"记得"但这里并不存在的石头：
     画法只差一处 —— 没有斜线纹理。
     这一处差异是第二章的全部内容：证据一直在你眼前，
     只是要先知道该看什么。 */
  function slab(x, y, w, h, opts = {}) {
    const ghost = !!opts.ghost;

    /* 台面不是矩形。空洞骑士里没有一条边是直的 —— 石头的边缘是崩掉的。
       这里在顶面和底面各啃掉/长出几块，位置由 x 决定，所以每一帧都一样，
       不会跳。碰撞盒仍然是规规矩矩的矩形：玩家看不见盒子，只看得见边。 */
    const seed = Math.abs(Math.round(x + y * 7));
    const chip = (i, span) => ((seed * (i * 31 + 17)) % 997) / 997 * span;
    const topEdge = [];
    for (let i = 0; i <= w; i += 9) topEdge.push(i);
    topEdge.push(w);

    g.fillStyle = ghost ? PAL.stone : PAL.stone;
    g.beginPath();
    g.moveTo(x, y + 1.5 + chip(1, 2.5));
    for (const tx of topEdge) g.lineTo(x + tx, y + 1.5 + chip(tx + 3, 2.5));
    g.lineTo(x + w, y + 7);
    g.lineTo(x, y + 7);
    g.closePath();
    g.fill();
    g.fillStyle = PAL.ink3;
    g.fillRect(x, y + 7, w, h - 7);

    // 底面缺几块：从下往上啃，露出底下的黑
    g.fillStyle = rgba(PAL.ink, .9);
    for (let i = 4; i < w - 6; i += 23) {
      const cw = 5 + chip(i, 14);
      if (chip(i + 91, 10) < 4) continue;
      g.fillRect(x + i, y + h - 1 - cw, 4 + chip(i + 7, 7), cw);
    }

    g.fillStyle = PAL.ink3;
    g.fillRect(x + w - 10, y + 7, 10, h - 7);
    g.fillStyle = rgba(PAL.ink, .55);
    g.fillRect(x, y + 7, w - 10, 3);
    g.strokeStyle = PAL.ink;
    g.lineWidth = 2.5;
    g.strokeRect(x + 1, y + 1, w - 2, h - 2);

    if (!ghost) {
      // 裂纹：短、碎、不平行。整齐的斜线看起来是瓷砖
      g.strokeStyle = rgba(PAL.stone, .10);
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 12; i < w - 10; i += 17) {
        const y1 = y + 10, y2 = y + 8 + chip(i, Math.min(h - 12, 30));
        g.moveTo(x + i, y1);
        g.lineTo(x + i + 5 + chip(i + 5, 8), y1 + (y2 - y1) * .6);
        g.lineTo(x + i + 3 + chip(i + 9, 10), y2);
      }
      g.stroke();
    } else {
      // 幽灵台多一层极淡的镀光，让它"看起来更像它说的那样"
      g.strokeStyle = rgba(PAL.glow, .10);
      g.lineWidth = 1;
      g.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
    }
  }

  function drawPlatforms() {
    for (const p of plats) {
      const x = p.x - state.camX;
      if (x > VW + 60 || x + p.w < -60) continue;
      if (p.hidden) continue;
      slab(x, p.y, p.w, p.h, p);
    }
    // 幽灵台：当真台面画，玩家只有靠"有没有斜线"分辨
    for (const p of world.ghosts || []) {
      const x = p.x - state.camX;
      if (x > VW + 60 || x + p.w < -60) continue;
      slab(x, p.y, p.w, p.h, { ghost: true });
    }
  }

  function drawRoutes() {
    if (!state.routeRevealed) return;
    for (const r of ROUTES) {
      for (let i = 0; i < r.points.length - 1; i++) {
        const a = r.points[i], b = r.points[i + 1];
        const x1 = a.x - state.camX, x2 = b.x - state.camX;
        if (x2 < -80 || x1 > VW + 80) continue;
        const len = Math.hypot(x2 - x1, b.y - a.y);
        const ang = Math.atan2(b.y - a.y, x2 - x1);
        g.save();
        g.translate(x1, a.y); g.rotate(ang);
        g.fillStyle = PAL.ink3; g.fillRect(0, 0, len, 13);
        g.fillStyle = PAL.stone; g.fillRect(0, 0, len, 5);
        g.fillStyle = rgba(PAL.ink, .6); g.fillRect(0, 5, len, 2.5);
        g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.strokeRect(0, 0, len, 13);
        g.strokeStyle = rgba(PAL.stone, .13); g.lineWidth = 1;
        g.beginPath();
        for (let k = 12; k < len - 8; k += 17) { g.moveTo(k, 7); g.lineTo(k + 15, 13); }
        g.stroke();
        g.restore();

        const pulse = 0.30 + Math.sin(state.t * 0.06 + i) * 0.12;
        g.globalAlpha = pulse;
        g.strokeStyle = state.route === r.id ? PAL.glow : PAL.paper;
        g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(x1, a.y - 1); g.lineTo(x2, b.y - 1); g.stroke();
        g.globalAlpha = 1;
      }
    }
  }

  /* ── 道具绘制 ── */
  function drawProps() {
    for (const p of world.props || []) {
      const x = p.x - state.camX;
      if (x < -120 || x > VW + 120) continue;
      if (chapter.drawProp) { chapter.drawProp(g, p, { state, x, VW, H, t: state.t, lit: state.lit, seen: state.seen, api }); continue; }
      defaultProp(p, x);
    }
  }

  function defaultProp(p, x) {
    const y = p.y ?? 250;
    const on = state.lit.has(p.id);
    const seen = state.seen.has(p.id);

    if (p.kind === 'socket') {
      // 接口：一个空着的卡座。插上工具之前，它是哑的
      g.fillStyle = PAL.ink3;
      g.fillRect(x - 13, y - 26, 26, 26);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 13, y - 26, 26, 26);
      g.fillStyle = on ? PAL.glow : PAL.mute;
      g.fillRect(x - 7, y - 20, 14, 7);
      g.fillStyle = on ? PAL.glow : PAL.ink;
      g.fillRect(x - 7, y - 11, 14, 5);
      if (on) {
        const gr = g.createRadialGradient(x, y - 13, 2, x, y - 13, 46);
        gr.addColorStop(0, rgba(PAL.glow, .34));
        gr.addColorStop(1, rgba(PAL.glow, 0));
        g.fillStyle = gr; g.fillRect(x - 46, y - 59, 92, 92);
      }
    } else if (p.kind === 'tower') {
      // 一座可以数的塔
      g.fillStyle = PAL.ink3;
      g.fillRect(x - 11, y - 62, 22, 62);
      g.fillStyle = PAL.deep;
      g.fillRect(x - 15, y - 70, 30, 10);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 11, y - 62, 22, 62);
    } else if (p.kind === 'sign') {
      // 墙上的符号：你需要把它记下来，因为它待会儿会忘
      g.fillStyle = PAL.deep;
      g.fillRect(x - 22, y - 40, 44, 40);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 22, y - 40, 44, 40);
      g.fillStyle = seen ? PAL.amber : PAL.mute2;
      const code = p.code || '◈';
      g.font = 'bold 19px ui-monospace,monospace';
      g.textAlign = 'center';
      g.fillText(code, x, y - 13);
      g.textAlign = 'left';
    } else if (p.kind === 'carve') {
      // 可以刻下东西的一小块墙面 —— 锚点
      g.fillStyle = on ? PAL.amber : PAL.deep;
      g.fillRect(x - 16, y - 34, 32, 34);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 16, y - 34, 32, 34);
      g.strokeStyle = on ? PAL.ink : PAL.mute; g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x - 8, y - 25); g.lineTo(x + 8, y - 25);
      g.moveTo(x - 8, y - 17); g.lineTo(x + 4, y - 17);
      g.moveTo(x - 8, y - 9); g.lineTo(x + 8, y - 9);
      g.stroke();
    } else if (p.kind === 'stone') {
      // 前人留下的石板：上面刻着一整套动作，不是一句话
      const armed = state.flags.skill === p.id;
      g.fillStyle = armed ? PAL.amber : PAL.deep;
      g.fillRect(x - 20, y - 16, 40, 16);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 20, y - 16, 40, 16);
      g.strokeStyle = armed ? PAL.ink : PAL.mute;
      g.lineWidth = 1.5;
      g.beginPath();
      for (let i = -14; i < 15; i += 7) { g.moveTo(x + i, y - 13); g.lineTo(x + i + 4, y - 4); }
      g.stroke();
      if (armed) {
        const gr = g.createRadialGradient(x, y - 8, 2, x, y - 8, 40);
        gr.addColorStop(0, rgba(PAL.amber, .32));
        gr.addColorStop(1, rgba(PAL.amber, 0));
        g.fillStyle = gr; g.fillRect(x - 40, y - 48, 80, 80);
      }
    } else if (p.kind === 'lamp') {
      // 终章：每走过一盏，就亮一盏。走完你就知道自己带走了什么
      const gr = g.createRadialGradient(x, y - 30, 3, x, y - 30, on ? 80 : 26);
      gr.addColorStop(0, on ? rgba(PAL.amber, .42) : rgba(PAL.amber, .09));
      gr.addColorStop(1, rgba(PAL.amber, 0));
      g.fillStyle = gr; g.fillRect(x - 80, y - 110, 160, 160);
      g.strokeStyle = PAL.ink; g.lineWidth = 2;
      g.fillStyle = on ? PAL.amber : PAL.deep;
      g.beginPath();
      g.moveTo(x, y - 46); g.lineTo(x + 11, y - 34); g.lineTo(x, y - 22); g.lineTo(x - 11, y - 34);
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = PAL.ink3;
      g.fillRect(x - 2, y - 22, 4, 22);
    } else if (p.kind === 'plaque') {
      /* 提示牌：一块竖着的方向牌。上面写的不是答案，是"往哪个方向问"。
         指针指到哪，先知的话就往哪边偏 —— 世界一动不动。 */
      g.fillStyle = PAL.ink3;
      g.fillRect(x - 3, y - 46, 6, 46);
      const active = on ? PAL.amber : PAL.mute2;
      g.fillStyle = active;
      g.fillRect(x - 20, y - 62, 40, 24);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 20, y - 62, 40, 24);
      g.fillStyle = PAL.ink;
      g.font = 'bold 13px ui-monospace,monospace';
      g.textAlign = 'center';
      g.fillText(p.code || '→', x, y - 45);
      g.textAlign = 'left';
      if (active === PAL.amber) {
        const gr = g.createRadialGradient(x, y - 52, 2, x, y - 52, 44);
        gr.addColorStop(0, rgba(PAL.amber, .30));
        gr.addColorStop(1, rgba(PAL.amber, 0));
        g.fillStyle = gr; g.fillRect(x - 44, y - 96, 88, 88);
      }
    } else if (p.kind === 'card') {
      /* 上下文里的一张卡片：有边有内容。被挤出去的时候会闪一下，
         所以它的边框在"快满"时会变紧、变暗。 */
      const held = !!p.held;
      g.fillStyle = PAL.ink3;
      g.fillRect(x - 15, y - 30, 30, 22);
      g.strokeStyle = held ? PAL.amber : PAL.mute2;
      g.lineWidth = 2.5;
      g.strokeRect(x - 15, y - 30, 30, 22);
      g.strokeStyle = held ? PAL.amber : PAL.mute;
      g.lineWidth = 1.5;
      g.beginPath();
      for (let i = 0; i < 3; i++) { g.moveTo(x - 9, y - 25 + i * 6); g.lineTo(x + (i === 2 ? 1 : 9), y - 25 + i * 6); }
      g.stroke();
      if (held) {
        const gr = g.createRadialGradient(x, y - 20, 2, x, y - 20, 38);
        gr.addColorStop(0, rgba(PAL.amber, .26));
        gr.addColorStop(1, rgba(PAL.amber, 0));
        g.fillStyle = gr; g.fillRect(x - 38, y - 58, 76, 76);
      }
    } else if (p.kind === 'device') {
      /* 一个要接线的设备：灯亮=接上了。旁边那根线由章节自己画。 */
      g.fillStyle = PAL.ink3;
      g.fillRect(x - 14, y - 38, 28, 38);
      g.fillStyle = on ? PAL.glow : PAL.mute;
      g.fillRect(x - 8, y - 32, 16, 11);
      g.fillStyle = on ? PAL.glow : PAL.ink;
      g.fillRect(x - 8, y - 17, 16, 5);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 14, y - 38, 28, 38);
      if (on) {
        const gr = g.createRadialGradient(x, y - 20, 2, x, y - 20, 40);
        gr.addColorStop(0, rgba(PAL.glow, .26));
        gr.addColorStop(1, rgba(PAL.glow, 0));
        g.fillStyle = gr; g.fillRect(x - 40, y - 60, 80, 80);
      }
    } else if (p.kind === 'hub') {
      /* 转接的大东西：所有的线都插到它身上，外面只留一个口。
         它亮起来的那一刻，应该像一盏灯、而不是像一个服务器。 */
      g.fillStyle = PAL.ink3;
      g.fillRect(x - 26, y - 44, 52, 44);
      g.strokeStyle = PAL.ink; g.lineWidth = 3;
      g.strokeRect(x - 26, y - 44, 52, 44);
      const lit = on ? PAL.glow : PAL.mute;
      g.fillStyle = lit;
      g.beginPath();
      g.moveTo(x, y - 36); g.lineTo(x + 12, y - 22); g.lineTo(x, y - 8); g.lineTo(x - 12, y - 22);
      g.closePath(); g.fill();
      g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke();
      g.fillStyle = on ? PAL.paper : PAL.mute2;
      for (let i = -1; i <= 1; i++) g.fillRect(x + i * 12 - 3, y - 4, 6, 4);
      if (on) {
        const gr = g.createRadialGradient(x, y - 22, 4, x, y - 22, 76);
        gr.addColorStop(0, rgba(PAL.glow, .30));
        gr.addColorStop(1, rgba(PAL.glow, 0));
        g.fillStyle = gr; g.fillRect(x - 76, y - 98, 152, 152);
      }
    } else if (p.kind === 'crate') {
      /* 打包好的项目：一只箱子。装齐了，它自己会合上。 */
      const full = !!p.full;
      g.fillStyle = full ? PAL.deep2 : PAL.ink3;
      g.fillRect(x - 20, y - 32, 40, 32);
      g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      g.strokeRect(x - 20, y - 32, 40, 32);
      g.strokeStyle = full ? PAL.amber : PAL.mute;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x - 20, y - 20); g.lineTo(x + 20, y - 20);
      g.moveTo(x - 6, y - 32); g.lineTo(x - 6, y);
      g.stroke();
      if (full) {
        const gr = g.createRadialGradient(x, y - 16, 2, x, y - 16, 46);
        gr.addColorStop(0, rgba(PAL.amber, .24));
        gr.addColorStop(1, rgba(PAL.amber, 0));
        g.fillStyle = gr; g.fillRect(x - 46, y - 62, 92, 92);
      }
    }
  }

  /* ── 盲区：先知看不见的地方 ──
     没有工具的时候，那一段世界是黑的 —— 不是"暗"，
     是真的什么都没有，连台面都不画。 */
  function drawBlind() {
    for (const b of world.blind || []) {
      if (state.lit.has(b.id)) continue;
      const x = b.x - state.camX;
      if (x > VW + 40 || x + b.w < -40) continue;
      g.fillStyle = PAL.line;
      g.fillRect(x, 0, b.w, H);
      g.strokeStyle = rgba(PAL.mute, .55);
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i < b.w; i += 19) { g.moveTo(x + i, 0); g.lineTo(x + i, H); }
      for (let j = 0; j < H; j += 19) { g.moveTo(x, j); g.lineTo(x + b.w, j); }
      g.stroke();
      if (b.w > 150) {
        g.fillStyle = rgba(PAL.bad, .55);
        g.font = 'bold 11px ui-monospace,monospace';
        g.textAlign = 'center';
        g.fillText('▚ 无法读取', x + b.w / 2, H * .62);
        g.textAlign = 'left';
      }
    }
  }

  function drawOracle() {
    if (!state.oracleAwake) {
      const x = 96 - state.camX;
      g.save(); g.translate(x, 232);
      g.fillStyle = PAL.deep;
      g.beginPath(); g.moveTo(0, -20); g.lineTo(15, 0); g.lineTo(0, 20); g.lineTo(-15, 0); g.closePath(); g.fill();
      g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke();
      g.restore();
      return;
    }
    const x = (world.oracleX ?? 96) - state.camX;
    if (x < -90 || x > VW + 90) return;
    const bob = Math.sin(state.t * 0.05) * 4;
    const sig = signal();
    g.save();
    g.translate(x, 230 + bob);

    const grad = g.createRadialGradient(0, 0, 4, 0, 0, 60);
    grad.addColorStop(0, rgba(PAL.glow, 0.30 * sig));
    grad.addColorStop(1, rgba(PAL.glow, 0));
    g.fillStyle = grad; g.fillRect(-60, -60, 120, 120);

    g.fillStyle = PAL.deep;
    g.beginPath(); g.moveTo(0, -24); g.lineTo(17, 0); g.lineTo(0, 24); g.lineTo(-17, 0); g.closePath(); g.fill();
    g.fillStyle = PAL.pale;
    g.beginPath(); g.moveTo(0, -24); g.lineTo(0, 0); g.lineTo(-17, 0); g.closePath(); g.fill();
    g.fillStyle = PAL.mute2;
    g.beginPath(); g.moveTo(0, -24); g.lineTo(17, 0); g.lineTo(0, 0); g.closePath(); g.fill();
    g.fillStyle = PAL.deep2;
    g.beginPath(); g.moveTo(-17, 0); g.lineTo(0, 0); g.lineTo(0, 24); g.closePath(); g.fill();
    g.strokeStyle = PAL.glow; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, -24); g.lineTo(17, 0); g.lineTo(0, 24); g.lineTo(-17, 0); g.closePath(); g.stroke();

    g.strokeStyle = rgba(PAL.pale, 0.5 + sig * 0.5); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-7, -7); g.lineTo(7, 7); g.moveTo(-7, 7); g.lineTo(7, -7); g.stroke();
    g.restore();

    if (sig > 0.05) {
      const px = state.px - state.camX, py = state.py - 16;
      g.strokeStyle = rgba(PAL.glow, 0.10 + sig * 0.22);
      g.lineWidth = 1;
      g.setLineDash([3, 6]);
      g.beginPath();
      g.moveTo(x, 230 + bob);
      g.quadraticCurveTo((x + px) / 2, 230 + bob - 42, px, py);
      g.stroke();
      g.setLineDash([]);
    }
  }

  function drawPlayer() {
    const x = Math.round(state.px - state.camX);
    const y = Math.round(state.py);
    const walk = Math.abs(state.vx) > 0.4 && state.onGround;
    const swing = walk ? Math.sin(state.t * 0.34) : 0;
    // 上升和下落的时候斗篷会翻起来一点 —— 静止时它垂着
    const lift = state.onGround ? 0 : Math.min(3.5, Math.abs(state.vy) * 0.3);

    g.save();
    g.translate(x, y);

    if (state.onGround) {
      g.fillStyle = rgba(PAL.line, .35);
      g.beginPath(); g.ellipse(0, 1, 11, 3, 0, 0, Math.PI * 2); g.fill();
    }

    // 腿：从斗篷底下探出来，走得快就摆得大
    g.strokeStyle = PAL.ink; g.lineWidth = 3.5; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-2, -9); g.lineTo(-2 + swing * 5, 0);
    g.moveTo(3, -9); g.lineTo(3 - swing * 5, 0);
    g.stroke();

    /* 斗篷。空洞骑士的人形全靠这一块剪影 ——
       上窄下宽、下摆有尖，风一吹会动。是先画这一块，
       再往上边安一颗小的、苍白的头；反过来画就成了雪人。 */
    g.fillStyle = PAL.body;
    g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(-5, -22);
    g.lineTo(5, -22);
    g.quadraticCurveTo(9, -14 + lift, 8.5 + swing * 0.8, -3 + lift);
    g.lineTo(4 + swing, -6 + lift);              // 下摆的第一个尖
    g.lineTo(0.5, -1 + lift);
    g.lineTo(-3.5 + swing, -6 + lift);           // 第二个尖
    g.lineTo(-8.5 + swing * 0.8, -3 + lift);
    g.quadraticCurveTo(-9, -14 + lift, -5, -22);
    g.closePath();
    g.fill(); g.stroke();

    // 肩线：一道极淡的受光边，把斗篷从背景里拔出来
    g.strokeStyle = rgba(PAL.paper, .30); g.lineWidth = 1;
    g.beginPath(); g.moveTo(-4.5, -21); g.lineTo(4.5, -21); g.stroke();

    /* 头：一颗小的苍白面具，不画五官，只留两个空洞的眼窝。
       空洞骑士的脸之所以有表情，是因为它什么都不给你。 */
    g.fillStyle = PAL.paper;
    g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(0, -36);
    g.quadraticCurveTo(7, -36, 6.5, -30);
    g.quadraticCurveTo(6, -25, 0, -25);
    g.quadraticCurveTo(-6, -25, -6.5, -30);
    g.quadraticCurveTo(-7, -36, 0, -36);
    g.closePath();
    g.fill(); g.stroke();

    g.fillStyle = PAL.ink;
    g.beginPath();
    g.ellipse(-2.6 * state.face, -30.5, 1.5, 2.1, 0, 0, Math.PI * 2);
    g.ellipse(2.6 * state.face, -30.5, 1.5, 2.1, 0, 0, Math.PI * 2);
    g.fill();

    // 手里那颗先知给的小东西：唯一的暖色，会呼吸
    const pulse = 0.55 + Math.sin(state.t * 0.08) * 0.2;
    g.save();
    g.translate(9 * state.face, -16);
    g.fillStyle = PAL.deep;
    g.beginPath(); g.moveTo(0, -5); g.lineTo(4, 0); g.lineTo(0, 5); g.lineTo(-4, 0); g.closePath(); g.fill();
    g.strokeStyle = rgba(PAL.glow, pulse); g.lineWidth = 1.2; g.stroke();
    g.restore();

    g.restore();
  }

  function drawParticles() {
    for (const pt of state.particles) {
      g.globalAlpha = Math.max(0, pt.life / 26);
      g.fillStyle = PAL.paper;
      g.fillRect(Math.round(pt.x - state.camX), Math.round(pt.y), pt.r, pt.r);
    }
    g.globalAlpha = 1;
  }

  function drawVignette() {
    /* 两层暗角。空洞骑士的边角不是"加了一层黑"，是光本来就照不到那儿 ——
       所以内圈很宽、很淡，只有最外面那一圈才真的黑透。
       以前这里叠了 3px 的扫描线，那是 CRT 的味道，不是石头的味道，去掉了。 */
    const outer = g.createRadialGradient(VW / 2, H / 2, H * 0.34, VW / 2, H / 2, H * 1.20);
    outer.addColorStop(0, rgba(PAL.ink, 0));
    outer.addColorStop(0.55, rgba(PAL.ink, .22));
    outer.addColorStop(1, rgba(PAL.ink, .93));
    g.fillStyle = outer; g.fillRect(0, 0, VW, H);

    const inner = g.createRadialGradient(VW / 2, H / 2, H * 0.16, VW / 2, H / 2, H * 0.78);
    inner.addColorStop(0, rgba(PAL.ink, 0));
    inner.addColorStop(1, rgba(PAL.ink, .30));
    g.fillStyle = inner; g.fillRect(0, 0, VW, H);
  }

  function drawDoor() {
    if (!door?.active) return;
    const x = door.x - state.camX;
    if (x < -200 || x > VW + 200) return;
    if (door.style === 'arch') return drawArch(x);

    const glow = state.reachedEnd ? 1 : 0.42;
    g.strokeStyle = PAL.ink; g.lineWidth = 4;
    g.fillStyle = PAL.ink;
    g.fillRect(x - 6, 62, 92, 128);
    g.fillStyle = rgba(PAL.glow, glow);
    g.fillRect(x + 2, 70, 76, 112);
    g.fillStyle = rgba(PAL.paper, glow * .85);
    g.fillRect(x + 14, 82, 52, 88);
    g.fillStyle = PAL.ink3;
    g.fillRect(x - 14, 50, 108, 16);
    g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
    g.strokeRect(x - 14, 50, 108, 16);
    const grad = g.createRadialGradient(x + 40, 126, 6, x + 40, 126, 120);
    grad.addColorStop(0, rgba(PAL.glow, 0.24 * glow));
    grad.addColorStop(1, rgba(PAL.glow, 0));
    g.fillStyle = grad; g.fillRect(x - 80, 6, 240, 240);
  }

  /* 拱门：终章最后的那个东西。它只有一半在画面里 ——
     上半是空的，光从里面出来，但你看不见门后面有什么。
     这一章不打算让玩家"看清出口"，所以门故意画得比门框简单。 */
  function drawArch(x) {
    const baseY = 300, r = 84, cx = x + 20;
    const glow = 0.5 + Math.sin(state.t * 0.03) * 0.12 + (state.reachedEnd ? 0.4 : 0);
    const gr = g.createRadialGradient(cx, baseY - r, 8, cx, baseY - r, 260);
    gr.addColorStop(0, rgba(PAL.amber, 0.34 * glow));
    gr.addColorStop(0.5, rgba(PAL.glow, 0.12 * glow));
    gr.addColorStop(1, rgba(PAL.glow, 0));
    g.fillStyle = gr; g.fillRect(cx - 260, baseY - r - 260, 520, 520);

    g.fillStyle = PAL.ink;
    g.beginPath();
    g.moveTo(cx - r, baseY);
    g.lineTo(cx - r, baseY - r);
    g.arc(cx, baseY - r, r, Math.PI, 0);
    g.lineTo(cx + r, baseY);
    g.closePath(); g.fill();
    g.fillStyle = rgba(PAL.paper, 0.30 * glow);
    g.beginPath();
    g.moveTo(cx - r + 8, baseY);
    g.lineTo(cx - r + 8, baseY - r);
    g.arc(cx, baseY - r, r - 8, Math.PI, 0);
    g.lineTo(cx + r - 8, baseY);
    g.closePath(); g.fill();

    g.fillStyle = PAL.ink3;
    g.fillRect(cx - r - 12, baseY - 4, 2 * r + 24, 8);
    g.strokeStyle = PAL.ink; g.lineWidth = 3;
    g.fillRect(cx - r - 16, baseY - 10, 2 * r + 32, 10);
    g.strokeRect(cx - r - 16, baseY - 10, 2 * r + 32, 10);
  }

  /* 交互提示：脚边有道具就浮在道具上；这章允许"对着空气按 E"，
     就浮在人物头顶 —— 否则玩家站在空地上完全不知道这个键能干什么，
     而"不知道能干什么"和"坏了"在体感上是同一件事。 */
  function drawPrompt() {
    if (!state.running) return;
    const p = nearestProp();
    let x, y, label, weak = false;
    if (p) {
      x = p.x - state.camX;
      y = (p.y ?? state.py) - 52;
      label = p.verb || 'E';
    } else if (chapter.confirmVerb) {
      x = state.px - state.camX;
      y = state.py - 54;
      label = chapter.confirmVerb;
      weak = true;
    } else return;

    const bob = Math.sin(state.t * 0.09) * 2;
    g.save();
    g.font = 'bold 11px ui-monospace,monospace';
    const w = Math.max(30, g.measureText(label).width + 18);
    g.globalAlpha = weak ? 0.62 : 1;
    g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
    g.fillStyle = weak ? PAL.paper : PAL.glow;
    g.beginPath(); g.roundRect(x - w / 2, y - 10 + bob, w, 20, 3); g.fill(); g.stroke();
    g.fillStyle = PAL.ink;
    g.textAlign = 'center';
    g.fillText(label, x, y + 4 + bob);
    g.textAlign = 'left';
    g.restore();
  }

  /* 按 E 的回音：一圈从身上推开的光，二十四帧走完。
     它不是装饰 —— 在这个游戏里，它是"这个键是活的"唯一当场能看见的证据。 */
  function drawRings() {
    for (const r of state.rings) {
      const k = 1 - r.life / r.max;              // 0 → 1
      const rad = 6 + k * 26;
      g.globalAlpha = (1 - k) * 0.9;
      g.strokeStyle = PAL.glow;
      g.lineWidth = 2.2 - k * 1.4;
      g.beginPath();
      g.ellipse(r.x - state.camX, r.y, rad, rad * 0.82, 0, 0, Math.PI * 2);
      g.stroke();
      if (k < 0.5) {
        g.globalAlpha = (1 - k * 2) * 0.6;
        g.lineWidth = 1.2;
        g.beginPath();
        g.ellipse(r.x - state.camX, r.y, rad * 0.55, rad * 0.45, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
  }

  /* 头顶那行小字：章节用它说明"刚才这一下发生了什么"。
     永远贴着人物，永远只有一行 —— 它是一张回执，不是台词。
     E 提示也占着 py-52 那一档，所以有提示时回执往上让一行。 */
  function drawTip() {
    if (!state.tip) return;
    const a = Math.min(1, state.tip.life / 26);
    const lift = (nearestProp() || chapter.confirmVerb) ? 30 : 0;
    const y = state.py - 52 - lift - (1 - Math.min(1, (state.tip.life) / 96)) * 8;
    g.save();
    g.globalAlpha = a;
    g.font = 'bold 11px ui-monospace,monospace';
    g.textAlign = 'center';
    g.fillStyle = PAL.ink;
    g.fillText(state.tip.text, state.px - state.camX + 1.5, y + 1.5);
    g.fillStyle = PAL.amber;
    g.fillText(state.tip.text, state.px - state.camX, y);
    g.textAlign = 'left';
    g.restore();
  }

  function render() {
    // 窗口尺寸变了，离屏密度也跟着变。setTransform 是绝对的，
    // 所以每帧重新铺一遍，前面所有的 save/restore 都在这之上叠加。
    SS = superScale();
    const bw = Math.round(VW * SS), bh = Math.round(H * SS);
    if (off.width !== bw || off.height !== bh) {
      off.width = bw; off.height = bh;
      // 缓冲换过一张，位图状态全丢了
      g.imageSmoothingEnabled = false;
    }
    g.setTransform(SS, 0, 0, SS, 0, 0);
    bg();
    drawBlind();
    chapter.drawBack?.(g, { state, camX: state.camX, VW, H, t: state.t });
    drawDoor();
    drawRoutes();
    drawPlatforms();
    drawProps();
    drawOracle();
    drawRings();
    drawParticles();
    drawPlayer();
    chapter.drawFront?.(g, { state, camX: state.camX, VW, H, t: state.t, lit: state.lit });
    drawTip();
    drawPrompt();
    drawVignette();

    const sx = canvas.width / VW;
    const sy = canvas.height / H;
    const sh = state.shake;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 离屏是高密度的，缩回窗口大小时要平滑 —— 这里开着才会柔，
    // 关着就又变回一小格一小格的了。（密度被钉在 1 倍时保持旧的硬边）
    ctx.imageSmoothingEnabled = SS > 1.01;
    ctx.imageSmoothingQuality = 'high';
    ctx.save();
    ctx.scale(sx, sy);
    ctx.translate(rnd(-.5, .5) * sh, rnd(-.5, .5) * sh);
    ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, VW, H);
    ctx.restore();
  }

  function loop() {
    if (!alive) return;
    step();
    render();
    requestAnimationFrame(loop);
  }

  function signal() {
    return chapter.signal
      ? chapter.signal(state)
      : Math.max(0.08, 1 - Math.abs(state.px - (world.oracleX ?? 96)) / 900);
  }

  /* 交给章节的把手。章节只通过这里碰引擎。 */
  const api = {
    state,
    world,
    VW, H, W_BOX, H_BOX,
    sfx,
    puff,
    reset,
    nearestProp,
    signal,
    setAuto(on) { autoDrive = !!on; if (!on) { input.left = input.right = input.jump = false; } },
    input,
    get auto() { return autoDrive; },
    addPlatform(p) { const c = { ...p }; plats.push(c); return c; },
    removePlatform(p) { const i = plats.indexOf(p); if (i >= 0) plats.splice(i, 1); },
    plats() { return plats; },
    say(text, pitch) { hooks.onDialogue?.(text, pitch); },
    mode(name, mode) { hooks.onMode?.(name, mode); },
    conf(v) { hooks.onConf?.(v); },
    /** 章节自己安排的坠落善后（比如第六章让它自己爬起来） */
    resetTo(p) { reset(true, p); },
    /** 终章：让门在你身后出现 */
    setDoor(x, style) { setDoor(x, style); },
    propReach,
    /** 章节抛出一次固定轨迹：技能跳、被推开、掉落 */
    launch(vx, vy) {
      state.vx = vx; state.vy = vy ?? -11.6;
      state.launch = { vx };
      state.capOverride = Math.max(3.6, Math.abs(vx));
      state.onGround = false;
      state.jumping = true;
    },
    /** 在人物头顶留一行很短的话 —— 用来回答"我这一下按出了什么" */
    tip(text, pitch) {
      state.tip = { text, life: 96, at: state.t };
      if (pitch) sfx.tick();
    },
    /** 章节覆盖 drawProp 时，多半只改一两件；其余交回这里画。 */
    drawDefaultProp(g, p, x) { defaultProp(p, x); },
    /* 玩家按下了 E。引擎不解释含义，但它保证这一下有回音 ——
       从前这个键在没写 onConfirm 的章节里是一声不响的，
       玩家只会得到一个结论：这游戏坏了。
       现在顺序是：先给一圈光（承认这一下收到了），再把这一下交给道具或章节。 */
    confirm() {
      // 和头顶那个 E 提示同一个条件：没在跑的时候，看不见提示，按了也不该有反应
      if (!state.running) return;
      state.rings.push({ x: state.px, y: state.py - 16, life: 24, max: 24 });
      puff(state.px, state.py - 14, 3);
      sfx.tick();
      const p = nearestProp();
      if (p) {
        state.seen.add(p.id);
        chapter.onInteract?.(state, api, p);
      } else {
        chapter.onConfirm?.(state, api);
      }
    },
  };

  return {
    state, api,
    signal,
    reset,
    start() { reset(false); },
    stop() { alive = false; state.running = false; },
    routes: ROUTES,
    setRoute(id) { state.route = id; state.routeRevealed = true; },
    clearRoute() { state.route = null; state.routeRevealed = false; },
    wakeOracle() { state.oracleAwake = true; },
    loop,
    loopFrame: step,
    render,
    world,
    plats: () => plats,
    resize() {
      /* 后备缓冲按物理像素开。上限 2 倍 —— 再高只是白烧电，
         清晰度该赚的已经被离屏那一层赚走了。 */
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    }
  };
}
