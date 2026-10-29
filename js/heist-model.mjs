// The playable simulation. No network calls or language model are used here.
// The renderer and the tests both consume this same state machine.
export const ROOM = { width: 15, depth: 10 };
export const POINTS = {
  home: { x: 2.4, y: 7.8 }, cover: { x: 6, y: 7 },
  card: { x: 12.2, y: 3.3 }, exit: { x: 13.6, y: .7 },
  cake: { x: 14.1, y: 1.4 }, cat: { x: 5.4, y: 3.6 },
};
export const DEVICES = {
  camera: { name: '监控', x: 1.2, y: .45, z: 105 },
  speaker: { name: '广播', x: 9.2, y: .25, z: 115 },
  projector: { name: '投影仪', x: 5.8, y: 8.6, z: 27 },
  robot: { name: '清洁机器人', ...POINTS.home, z: 20 },
};
export const OBSTACLES = [
  { x: 4, y: 2.2, w: 1.5, h: 1.3 },
  { x: 8, y: 2, w: 1.4, h: 1.2 },
  { x: 9.8, y: 7.5, w: 1.5, h: 1.2 },
];
const copy = p => ({ x: p.x, y: p.y });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const isWalkable = (p, margin = .2) => p.x >= .5 && p.x <= 14.5 && p.y >= .5 && p.y <= 9.5 &&
  !OBSTACLES.some(o => p.x > o.x - margin && p.x < o.x + o.w + margin && p.y > o.y - margin && p.y < o.y + o.h + margin);

// A* on the actual floor: neither a robot nor a guard can pass through a plinth.
export function findPath(start, end) {
  if (!isWalkable(end)) return [];
  const key = p => `${p.x},${p.y}`;
  const snap = p => ({ x: Math.round(p.x * 2) / 2, y: Math.round(p.y * 2) / 2 });
  const a = snap(start), b = snap(end), open = [{ ...a, g: 0, f: distance(a, b) }];
  const cost = new Map([[key(a), 0]]), prev = new Map();
  const directions = [[.5, 0], [-.5, 0], [0, .5], [0, -.5]];
  while (open.length) {
    open.sort((u, v) => u.f - v.f);
    const n = open.shift();
    if (key(n) === key(b)) {
      const path = [copy(end)]; let k = key(n);
      while (prev.has(k)) { const p = prev.get(k); path.unshift(copy(p)); k = key(p); }
      return path;
    }
    for (const [dx, dy] of directions) {
      const q = { x: n.x + dx, y: n.y + dy }, g = n.g + .5;
      if (!isWalkable(q) || g >= (cost.get(key(q)) ?? Infinity)) continue;
      cost.set(key(q), g); prev.set(key(q), n);
      open.push({ ...q, g, f: g + distance(q, b) });
    }
  }
  return [];
}
function travel(actor, dt, speed) {
  let left = dt * speed;
  while (left > 0 && actor.path.length) {
    const p = actor.path[0], d = distance(actor, p);
    if (d > .001) actor.angle = Math.atan2(p.y - actor.y, p.x - actor.x);
    if (d <= left) { actor.x = p.x; actor.y = p.y; actor.path.shift(); left -= d; }
    else { actor.x += (p.x - actor.x) / d * left; actor.y += (p.y - actor.y) / d * left; left = 0; }
  }
}
export function createHeist() {
  const s = {
    phase: 'intro', time: 0, connected: { camera: false, speaker: false, projector: false, robot: false },
    selected: null, placement: false, scan: 0, suspicion: 0, alarm: 0,
    card: 'desk', route: null, attempts: 0, interventions: 0,
    closing: null, doorLocked: false, cakeUsed: false, cat: null,
    guard: { x: 10.5, y: 3.8, angle: Math.PI / 2, path: [], mode: 'patrol', timer: 0, patrol: 0, bubble: '', bubbleUntil: 0 },
    robot: { ...POINTS.home, angle: 0, path: [], mode: 'idle', careful: false },
    player: { x: 1.4, y: 8.2, angle: -.6, path: [] },
    speech: '我读过 4,096 本盗窃小说。实践经验……今晚开始。',
    speechTag: '先知 · 你的临时共犯', speechUntil: 0,
    events: [], journal: [], lastSound: null, eventId: 0,
  };
  function event(type, detail, result = 'ok') {
    const e = { id: ++s.eventId, t: +s.time.toFixed(1), type, detail, result };
    s.events.push(e); if (s.events.length > 90) s.events.shift();
    s.lastSound = type;
  }
  function say(text, tag = '先知 · 你的临时共犯') { s.speech = text; s.speechTag = tag; s.speechUntil = s.time + 7; }
  function guardSay(text) { s.guard.bubble = text; s.guard.bubbleUntil = s.time + 3.5; }
  function remember(text) { if (!s.journal.includes(text)) s.journal.push(text); }
  function start() { if (s.phase !== 'intro') return; s.phase = 'play'; event('start', '拿到保安身后的通行证'); say('通行证在他身后。先接上监控，让我也看看。'); }
  function connect(id) {
    if (s.phase !== 'play' || !(id in s.connected) || s.connected[id]) return false;
    s.connected[id] = true; s.interventions++;
    event('connect', { device: id });
    const lines = {
      camera: '看到了！通行证在桌上，橙色是他的视线。那条“通风管”……原来是一幅画。',
      robot: '轮子归我了。它的夹爪刚好能拿通行证。现在得想办法绕过那位夜班先生。',
      speaker: '全馆都能听见我了。休息室、闭馆通知……你想让他相信哪一个？',
      projector: '这台能投出一只很大的猫。把猫放远一点，他就会过去看。',
    };
    say(lines[id]);
    if (id === 'camera') { s.scan = 2.4; remember('现场信息：通行证位置、保安视线、闭馆联动'); event('camera.observe', { card: POINTS.card, guard: copy(s.guard), sign: '闭馆广播会启动落闸' }); }
    return true;
  }
  function broadcast(message) {
    if (s.phase !== 'play' || !s.connected.speaker) return false;
    s.interventions++; event('speaker.broadcast', { message });
    if (message === 'cancel') {
      s.closing = null; s.doorLocked = false;
      say('解除闭馆。闸门重新升起来了，拿到卡以后再走。'); guardSay('又改时间？');
      if (s.guard.mode === 'closing') returnGuard();
      return true;
    }
    if (message === 'cake') {
      if (s.cakeUsed) { guardSay('休想再骗我一次。'); say('同一个谎话，他记住了。试试投影仪，或者换一句广播。'); event('guard.response', '拒绝重复的蛋糕广播', 'rejected'); return false; }
      s.cakeUsed = true; s.guard.mode = 'cake'; s.guard.timer = 22;
      s.guard.path = findPath(s.guard, POINTS.cake); s.route = 'cake'; guardSay('还有蛋糕？我就去看一眼。');
      say('“请夜班同事到休息室领取蛋糕。”他动了，窗口大约二十秒。');
      remember('广播改变了保安的行动；机器人仍需执行取卡');
    } else if (message === 'closing') {
      s.closing = 24; s.doorLocked = false;
      s.guard.mode = 'closing'; s.guard.path = findPath(s.guard, POINTS.cake); s.guard.timer = 100;
      s.route = 'closing'; guardSay('终于下班了。');
      say('他撤了！等等，闭馆还会落闸。24 秒，或者随时撤回这条广播。', '先知 · 发现了连带后果');
      remember('闭馆事件同时驱动保安撤离与闸门倒计时');
    }
    return true;
  }
  function placeCat(p) {
    if (s.phase !== 'play' || !s.connected.projector || !isWalkable(p, .6) || p.x > 12.8 || p.y < 1.3) return false;
    s.placement = false; s.cat = { ...copy(p), timer: 18 };
    s.interventions++; s.route = 'cat';
    s.guard.mode = 'cat'; s.guard.timer = 18;
    const near = { x: Math.min(14, p.x + 1.6), y: p.y + .5 };
    s.guard.path = findPath(s.guard, isWalkable(near) ? near : { x: p.x, y: Math.min(9, p.y + 1.6) });
    guardSay('这件展品……刚才会动吗？');
    event('projector.place', copy(p));
    say(p.x > 9 ? '猫离通行证很近，他也会跟过去。投影可以挪，试着把他引向另一边。' : '他去看猫了。趁现在，让机器人取卡；也可以先让机器人等机会。');
    remember('投影的位置决定保安被引向哪里');
    return true;
  }
  function run(careful = false) {
    if (s.phase !== 'play' || s.alarm > 0) return false;
    if (s.card === 'player') { say('卡已经在你手里。点右边的出口，我们去找你的影子。'); return false; }
    if (!s.connected.camera) { say('我还看不到展厅，没法确认卡在哪。点墙上的监控，把现场给我。', '缺少现场信息'); event('plan', '缺少当前现场', 'needs_observation'); return false; }
    if (!s.connected.robot) { say('位置看到了，路线也能画。但我还没有能动手的设备。接上左下角的机器人。', '已有方案 · 缺少执行工具'); event('plan', '已定位通行证，尚未连接执行设备', 'needs_tool'); return false; }
    if (s.robot.mode !== 'idle') { say('它正在行动。可以点“召回”，也可以继续帮它引开保安。'); return false; }
    s.attempts++; s.interventions++; s.robot.careful = careful;
    s.robot.mode = careful ? 'waiting' : 'outbound';
    s.robot.path = careful ? [] : findPath(s.robot, POINTS.card);
    event('robot.fetch', { target: 'pass', observeBeforeMoving: careful });
    say(careful ? '我先盯着他的视线。你制造机会，我判断什么时候出发。' : '出发。橙色扇形里会被看见，你还能用广播或投影帮它。');
    return true;
  }
  function recall() {
    if (s.phase !== 'play' || s.robot.mode === 'idle' || s.alarm > 0) return;
    s.interventions++; s.robot.mode = 'returning'; s.robot.path = findPath(s.robot, POINTS.home);
    event('robot.recall', '人工中止，返回掩体'); say('收到，先回来。设备都还连着，换个办法就行。');
  }
  function returnGuard() {
    s.guard.mode = 'patrol'; s.guard.timer = 0;
    s.guard.path = findPath(s.guard, { x: 10.5, y: 3.8 });
    s.guard.patrol = 0;
  }
  function caught() {
    s.alarm = 3; s.suspicion = 1;
    s.robot.path = []; s.robot.mode = 'caught';
    s.guard.mode = 'alarm'; s.guard.path = [];
    guardSay('谁给扫地机装了夹爪？！');
    if (s.card === 'robot') s.card = 'desk';
    event('guard.detect', { robot: copy(s.robot) }, 'caught');
    say('被看见了。卡还在桌上，设备也还在。引开他，再试一次。', '失手了 · 3 秒后回到掩体');
  }
  function exit() {
    if (s.phase !== 'play') return false;
    if (s.card !== 'player') { say('出口要刷通行证。先让机器人把桌上那张卡带回来。'); return false; }
    if (s.doorLocked) { say('闭馆把闸门锁了。在广播里撤回闭馆通知，门会重新打开。'); return false; }
    s.player.path = findPath(s.player, POINTS.exit);
    event('player.exit', '带通行证走向出口'); return true;
  }
  function visibleToGuard(p) {
    const g = s.guard;
    if (['cake', 'closing'].includes(g.mode) && !g.path.length) return false;
    const d = distance(g, p), angle = Math.atan2(p.y - g.y, p.x - g.x);
    const diff = Math.atan2(Math.sin(angle - g.angle), Math.cos(angle - g.angle));
    return d < 1.05 || (d < 4.4 && Math.abs(diff) < .63);
  }
  const patrol = [{ x: 10.5, y: 6.4 }, { x: 7.2, y: 6.4 }, { x: 7.2, y: 4.6 }, { x: 10.5, y: 3.8 }];
  function update(dt) {
    // One fixed simulation step, provided by the animation loop or by tests.
    if (s.phase !== 'play') return;
    s.time += dt; s.scan = Math.max(0, s.scan - dt);
    if (s.closing !== null && s.closing > 0) {
      s.closing = Math.max(0, s.closing - dt);
      if (s.closing === 0) { s.doorLocked = true; s.player.path = []; event('shutter.close', '闭馆倒计时结束'); say('落闸了。别急，接着广播“解除闭馆”就能重新开门。'); }
    }
    if (s.cat) { s.cat.timer -= dt; if (s.cat.timer <= 0) s.cat = null; }
    if (s.alarm > 0) {
      s.alarm = Math.max(0, s.alarm - dt);
      if (!s.alarm) {
        Object.assign(s.robot, copy(POINTS.home), { mode: 'idle', path: [] });
        Object.assign(s.guard, { x: 10.5, y: 3.8, angle: Math.PI / 2 });
        s.suspicion = 0; returnGuard();
      }
      return;
    }
    const g = s.guard, r = s.robot;
    if (g.mode === 'patrol' && !g.path.length) { g.path = findPath(g, patrol[g.patrol]); g.patrol = (g.patrol + 1) % patrol.length; }
    travel(g, dt, g.mode === 'patrol' ? .65 : 1.5);
    if (g.mode !== 'patrol') {
      g.timer -= dt;
      if (g.mode === 'cat' && !g.path.length && s.cat) g.angle = Math.atan2(s.cat.y - g.y, s.cat.x - g.x);
      if (g.timer <= 0) { guardSay(g.mode === 'cake' ? '蛋糕呢？' : '……只是投影。'); returnGuard(); }
    }
    if (r.mode === 'waiting' && g.mode !== 'patrol' && distance(g, POINTS.card) > 5) {
      r.mode = 'outbound'; r.path = findPath(r, POINTS.card);
      event('agent.observe', { guardDistance: +distance(g, POINTS.card).toFixed(1), decision: '出发取卡' });
      say('他已经离开卡桌。我看见机会了，出发。', '观察 → 行动');
    }
    travel(r, dt, r.mode === 'returning' ? 2.65 : 2.35);
    if (r.mode === 'outbound' && !r.path.length) {
      s.card = 'robot'; r.mode = 'returning'; r.path = findPath(r, POINTS.home);
      event('robot.grab', { object: 'pass', verified: true }); say('夹到了。正在把通行证送回你手里。', '执行结果 · 通行证已取得');
    }
    if (r.mode === 'returning' && !r.path.length) {
      r.mode = 'idle';
      if (s.card === 'robot') { s.card = 'player'; event('robot.deliver', '通行证交给玩家'); say('卡到手了！点亮着的出口，我们去找你的影子。', '任务完成 · 已核验交付'); }
    }
    const active = ['outbound', 'returning'].includes(r.mode);
    if (active && visibleToGuard(r) && distance(r, POINTS.home) > 2) s.suspicion = Math.min(1, s.suspicion + dt * 1.3);
    else s.suspicion = Math.max(0, s.suspicion - dt * .8);
    if (s.suspicion >= 1) { caught(); return; }
    travel(s.player, dt, 3.1);
    if (s.card === 'player' && distance(s.player, POINTS.exit) < .1 && !s.doorLocked) {
      s.phase = 'won'; event('complete', { route: s.route ?? 'timing', attempts: s.attempts, seconds: +s.time.toFixed(1) });
    }
  }
  return { state: s, start, connect, broadcast, placeCat, run, recall, exit, update, visibleToGuard, say };
}
