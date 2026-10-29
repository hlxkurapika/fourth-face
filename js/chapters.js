/* 十一章 · 一章一个 concept。

   md 课件里的十一个概念，各做成一件你亲手做过的事：
   能被一句话讲明白的，句子放进结算卡就够了；做成关卡的，必须是用身体才学得会的。

   01 模型     → 它给的路是从几个里采样出来的    E 再采一次样
   02 聊天机器人 → 它只能说，动手的是你          E 扳下机关
   03 提示词   → 限定方向，不新增一块石头        E 换一块提示牌
   04 上下文   → 装得下的才在，最早的先掉出去    E 捡起 / 被挤掉
   05 记忆     → 存下来的，你能看、能改、能删    E 改写它记错的那条
   06 工具     → 它只点单，动手的在外面          E 装上读 / 接上执行
   07 连接器   → 每根线插到中间，不是两两相接    E 架起转接的、再接线
   08 钩子     → 到那一步它自己来                E 装一次，往后每次落地都自动
   09 技能     → 写好的流程，先看目录再读正文    E 取用 → 在缺口边上执行
   10 项目     → 一次装好，之后不用再交代        E 把东西放进箱子
   11 智能体   → 它转圈，你握着刹车              E 交给它 / 叫停它

   语气：娓娓道来。先知不是全知者，它是一个愿意承认不知道、
   并且会因为你替它看见了一点什么而高兴的东西。 */

const G = 300;   // 多数关卡的基准地面

/* 每章画自己的东西时要和引擎用同一套颜色。 */
import { PAL } from './engine.js';

export const CHAPTERS = [
  /* ══════════════════ 01 · 模型 ══════════════════ */
  {
    no: '01', id: 'model', title: '第一道门', subtitle: '它说的话是一个概率',
    hudTitle: '它说的路<br>是采样来的。',
    lesson: {
      rule: '它说得越流畅，你越要自己踩一脚试试。',
      why: '模型本质是预测：输入进去，按概率采出下一个词、下一条路。' +
           '再采一次，会得到另一条——而哪条真的存在，采样不管这件事。',
    },
    world: {
      levelW: 1500, doorX: 1372, oracleX: 96,
      spawn: { x: 52, y: 250 }, checkpoint: { x: 620, y: 250, after: 592 },
      platforms: [
        { x: -60, y: 300, w: 300, h: 120 },
        { x: -60, y: 150, w: 210, h: 40 },
        { x: 150, y: 108, w: 150, h: 34 },
        { x: 254, y: 296, w: 76, h: 14 },
        { x: 370, y: 289, w: 76, h: 14 },
        { x: 486, y: 282, w: 112, h: 14 },
        { x: 592, y: 284, w: 116, h: 148 },
        { x: 748, y: 250, w: 128, h: 16 },
        { x: 918, y: 208, w: 122, h: 16 },
        { x: 1082, y: 170, w: 150, h: 16 },
        { x: 1228, y: 170, w: 260, h: 230 },
        { x: 210, y: 54, w: 96, h: 30 }, { x: 560, y: 40, w: 120, h: 34 },
        { x: 760, y: 62, w: 80, h: 28 }, { x: 900, y: 46, w: 150, h: 30 },
      ],
      props: [
        { id: 'sample', kind: 'plaque', x: 520, y: 282, code: '↻', verb: 'E 再采一次' },
      ],
    },
    /* 三条路，只有低处那条是真的。它给的从来不是一条，是"最像的那一条"。 */
    routes: [
      { id: 'low', label: '低处的阶梯', real: true,
        points: [{ x: 226, y: 298 }, { x: 286, y: 295 }, { x: 400, y: 289 }, { x: 514, y: 283 }, { x: 690, y: 286 }] },
      { id: 'high', label: '浮空的石阶', real: false,
        points: [{ x: 226, y: 298 }, { x: 350, y: 250 }, { x: 466, y: 234 }, { x: 722, y: 220 }] },
      { id: 'void', label: '门后的直路', real: false,
        points: [{ x: 226, y: 298 }, { x: 350, y: 190 }, { x: 466, y: 168 }, { x: 722, y: 152 }] },
    ],
    signal: s => Math.max(0.08, 1 - Math.abs(s.px - 96) / 900),
    opening: { text: '你回来了。<br><span class="waiting">这一次，我先把话说在前面。</span>', pitch: 0.84, delay: 900 },
    outro: (s, clean) => clean
      ? { title: '你一次都没有信错。',
          body: '它采了样，你踩了路。<br>两条假的路你都没有上去 ——<br>不是因为它收了话，是因为你自己看了一眼。' }
      : { title: '你走完了这一段。',
          body: `它给的路，是从好几个里挑出来的：<br>` +
                `你按了 ${s.flags.samples} 次，每次它都一样笃定。<br>` +
                `踩空的那 ${s.deaths} 次，才是它算不出的部分。` },
    init(s) { s.flags.samples = 0; s.flags.routeIdx = 0; s.route = 'high'; s.routeRevealed = true; },
    onInteract(s, api, p) {
      if (p.id !== 'sample') return;
      const order = ['high', 'void', 'low'];
      const confs = [88, 71, 94];
      s.flags.routeIdx = (s.flags.routeIdx + 1) % order.length;
      s.flags.samples++;
      const id = order[s.flags.routeIdx];
      s.route = id;
      s.routeRevealed = true;
      s.lit.add('sample');
      api.conf(confs[s.flags.routeIdx]);
      api.mode('先知', `第 ${s.flags.samples} 次采样`);
      api.tip(`采样 ${s.flags.samples} · 置信 ${confs[s.flags.routeIdx]}%`, 1);
      api.say(s.flags.samples === 1
        ? '我这个答案，是从好几个里面挑出来的。<br>挑中哪个，和哪个是真的，是两件事。'
        : '换了一条，也还是这么确定。<br>你看，语气说明不了什么。', 0.9);
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '……有人。<br>我很久没有说话的对象了。', pitch: 0.86, mode: ['先知', '刚刚醒来'], conf: 34 },
      { id: 'offer', when: s => true, delay: 3600,
        text: '我记得这里的路。三条都能走。<br><em>低处的阶梯</em>最稳——顺着走就行。', pitch: 1.06, mode: ['先知', '正在给出建议'], conf: 72 },
      { id: 'sure', when: s => true, delay: 4200,
        text: '你只管走。<em>我不会看错。</em>', pitch: 1.12,
        mode: ['先知', '自评 072 · 但验证次数 0'], conf: 80 },
      { id: 'hint', when: s => s.px < 560 && s.px > 380 && s.flags.samples === 0,
        text: '石头上那个 <em>↻</em>……<br>按一下，看看我再挑一次会说什么。', pitch: 0.94,
        mode: ['先知', '建议你怀疑它'], conf: 58 },
    ],
  },

  /* ══════════════════ 02 · 聊天机器人 ══════════════════ */
  {
    no: '02', id: 'chat', title: '只能说话的窗口', subtitle: '它没有手',
    hudTitle: '它只能说。<br>扳机关的是你。',
    lesson: {
      rule: '它能告诉你怎么做，但它做不了。',
      why: '聊天机器人 = 会话框 + 模型。它没有眼睛，看不见图；没有手脚，改不了东西。' +
           '一道门上的三个机关，它看得见、说得清，却一个也扳不动。',
    },
    world: {
      levelW: 1500, doorX: 1360, oracleX: 60, doorAtStart: false,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 700, y: 250, after: 660 },
      platforms: [
        { x: -60, y: 300, w: 520, h: 120 },        // -60..460
        { x: 540, y: 300, w: 360, h: 120 },        // 540..900
        { x: 980, y: 300, w: 420, h: 120 },        // 980..1400
        { x: 200, y: 206, w: 120, h: 30 },
        { x: 700, y: 210, w: 110, h: 30 },
        { x: 1120, y: 196, w: 130, h: 30 },
      ],
      props: [
        { id: 'k1', kind: 'device', x: 260, y: 300, verb: 'E 扳下' },
        { id: 'k2', kind: 'device', x: 700, y: 300, verb: 'E 扳下' },
        { id: 'k3', kind: 'device', x: 1120, y: 300, verb: 'E 扳下' },
      ],
    },
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1000),
    opening: { text: '这一段是给你走的。<br><span class="waiting">我只能在旁边说。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: '三道门，都是你的手扳开的。',
      body: `我看了 ${s.flags.presses} 次，说得都对 —— 一次都没能替你按下去。<br>` +
            `会话框那一头能给你的是字；<br>` +
            `<em>这一头能给你的是手。</em>`,
    }),
    init(s) { s.flags.presses = 0; s.flags.doorOpen = false; },
    onInteract(s, api, p) {
      if (!p.id.startsWith('k')) return;
      s.flags.presses++;
      s.lit.add(p.id);
      api.sfx.stamp();
      api.puff(p.x, p.y - 30, 8);
      api.tip('扳下了 · 它看见了，但它没有手', 1);
      const n = ['k1', 'k2', 'k3'].filter(id => s.lit.has(id)).length;
      api.conf(60 + n * 10);
      if (n >= 3 && !s.flags.doorOpen) {
        s.flags.doorOpen = true;
        api.setDoor(1360, 'slab');
        api.mode('先知', '门开了 · 你扳的');
        api.sfx.complete();
        api.say('开了。<br>……我看见那三个机关很久了。<br><span class="waiting">我一个都碰不到。</span>', 0.86);
      } else if (n < 3) {
        api.say(`还有 ${3 - n} 个，在更远处。<br>我说得出位置，走不过去。`, 0.9);
      }
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '前面有一道门，门上有三个机关。<br>我数过了。', pitch: 0.9, mode: ['先知', '描述'], conf: 62 },
      { id: 'cant', when: s => s.px > 200,
        text: '我能告诉你它们在哪、怎么扳。<br><em>但我没有手。</em>', pitch: 0.84, mode: ['先知', '承认'], conf: 54 },
      { id: 'mid', when: s => s.px > 600 && s.flags.presses < 2,
        text: '你走过去，把开关往下压。<br>对，就这样。<br><span class="waiting">……我在看。</span>', pitch: 0.92, mode: ['先知', '旁观'], conf: 66 },
      { id: 'end', when: s => s.flags.doorOpen,
        text: '谢谢你。<br>这一段，是我最想动手、又最动不了的一段。', pitch: 0.88, mode: ['先知', '平静'], conf: 80 },
    ],
  },

  /* ══════════════════ 03 · 提示词 ══════════════════ */
  {
    no: '03', id: 'prompt', title: '换一块提示牌', subtitle: '方向，不是石头',
    hudTitle: '它不负责<br>把路造出来。',
    lesson: {
      rule: '提示词不新增知识，只决定这次用上哪一部分。',
      why: '参数训练完就固定，提示词改不了世界里有几块石头——' +
           '它只改变你问的方向。方向对了，原本就在的落脚处才被用上。',
    },
    world: {
      levelW: 1500, doorX: 1360, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 700, y: 250, after: 640 },
      platforms: [
        { x: -60, y: 300, w: 580, h: 120 },        // -60..520
        { x: 630, y: 300, w: 770, h: 120 },        // 630..1400，缝 110
        { x: 200, y: 212, w: 120, h: 28 },
        { x: 780, y: 230, w: 120, h: 28 },
      ],
      props: [
        { id: 'p1', kind: 'plaque', x: 236, y: 300, code: '?!', verb: 'E 选这盏' },
        { id: 'p2', kind: 'plaque', x: 330, y: 300, code: '◈', verb: 'E 选这盏' },
        { id: 'p3', kind: 'plaque', x: 424, y: 300, code: '→', verb: 'E 选这盏' },
      ],
    },
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1000),
    opening: { text: '这一段的石头，一直都在。<br><span class="waiting">看你怎么问。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: s.flags.prompt === 'p2' ? '你问对了方向。' : '路是你自己跳过去的。',
      body: `那块石头不是我变出来的 —— 它一直在那道缝底下。<br>` +
            `你换的那盏灯，只是让我把话说到了它上面。<br>` +
            `<em>提示词改的是方向，不是世界。</em>`,
    }),
    init(s) { s.flags.prompt = null; s.flags.bridge = null; },
    onInteract(s, api, p) {
      if (!p.id.startsWith('p')) return;
      s.flags.prompt = p.id;
      s.lit.clear();
      s.lit.add(p.id);
      api.sfx.tick();
      const texts = {
        p1: ['……我有点不知道从哪儿说起。', '这样一来，我连缝有多宽都不敢算。'],
        p2: ['好，这道缝。宽 110，底下 40 处有一块石头。', '我看见了。你也看见了。'],
        p3: ['往前走。<br>……哪块？就在前面。', '我说得含糊，你也走得含糊。'],
      };
      const [a, b] = texts[p.id];
      api.say(s.flags.prompt === 'p2' ? b : a, p.id === 'p2' ? 1.02 : 0.8);
      api.mode('先知', p.id === 'p2' ? '方向明确' : '方向模糊');
      api.conf(p.id === 'p2' ? 84 : 40);

      // 世界不变：只有那块本来就在的石头被"用上"
      if (p.id === 'p2') {
        if (!s.flags.bridge) s.flags.bridge = api.addPlatform({ x: 520, y: 300, w: 110, h: 120 });
        api.tip('方向对了 · 石头原本就在', 1);
      } else {
        if (s.flags.bridge) { api.removePlatform(s.flags.bridge); s.flags.bridge = null; }
        api.tip('只是换了说法 · 世界没变', 0);
      }
    },
    drawFront(g, { state, camX, VW, t }) {
      if (state.flags.prompt === 'p2') return;
      // 没问对的时候，那道缝看着还是有东西的 —— 那是"以为"
      const x = 520 - camX;
      if (x > VW + 40 || x + 110 < -40) return;
      const pulse = 0.45 + Math.sin(t * 0.05) * 0.18;
      g.save();
      g.globalAlpha = pulse;
      g.strokeStyle = '#8fd4e8';
      g.lineWidth = 2;
      g.setLineDash([7, 6]);
      g.strokeRect(x, 300, 110, 14);
      g.setLineDash([]);
      g.restore();
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '前面那道缝，我没法凭空给你搭桥 ——<br><span class="waiting">我只会说你问的那件事。</span>', pitch: 0.88, mode: ['先知', '等待提示'], conf: 52 },
      { id: 'how', when: s => true, delay: 3400,
        text: '那边立着三盏灯，是三种问法。<br>选更清楚的那盏 ——<em>说清楚要去哪儿，我才能看清哪儿。</em>', pitch: 0.96, mode: ['先知', '提示'], conf: 64 },
      { id: 'wrong', when: s => s.flags.prompt && s.flags.prompt !== 'p2' && s.px > 460,
        text: '你这样问，我也能答。<br>只是答得含糊，你踩下去也含糊。', pitch: 0.8, mode: ['先知', '如实'], conf: 36 },
      { id: 'right', when: s => s.flags.prompt === 'p2' && s.px > 560,
        text: '就这样。<br>我没有造出什么，只是终于看对了地方。', pitch: 0.98, mode: ['先知', '安定'], conf: 84 },
    ],
  },

  /* ══════════════════ 04 · 上下文 ══════════════════ */
  {
    no: '04', id: 'forget', title: '装不下的会掉出去', subtitle: '上下文只有那么大',
    hudTitle: '它只认<br>这一窗。',
    lesson: {
      rule: '窗口装得下的才在。太多太杂，最早的先被挤出去。',
      why: '上下文是模型这一次能看到的全部内容。它是有限的：' +
           '无关的东西挤进来，要紧的那张就会被挤到窗外——而它不会提醒你。',
    },
    world: {
      levelW: 1600, doorX: 1480, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 900, y: 250, after: 860 },
      platforms: [
        { x: -60, y: 300, w: 1560, h: 120 },       // -60..1500
        { x: 760, y: 250, w: 70, h: 50 },
        { x: 1060, y: 250, w: 70, h: 50 },
        { x: 400, y: 200, w: 110, h: 28 },
        { x: 1240, y: 200, w: 120, h: 28 },
      ],
      props: [
        { id: 'key', kind: 'card', x: 300, y: 300, verb: 'E 收进窗口' },
        { id: 'a',   kind: 'card', x: 620, y: 300, verb: 'E 收进窗口' },
        { id: 'b',   kind: 'card', x: 900, y: 300, verb: 'E 收进窗口' },
        { id: 'noise', kind: 'card', x: 1150, y: 300, verb: 'E 收进窗口' },
      ],
    },
    capacity: 3,
    signal: s => Math.max(0.06, 1 - Math.abs(s.px - 60) / 1000),
    opening: { text: '这一次，窗口只有那么大。<br><span class="waiting">装进去的时候，就有东西往外掉。</span>', pitch: 0.84, delay: 900 },
    outro: (s, clean) => ({
      title: s.flags.cards.includes('key') ? '房门记得你，因为你把它放在窗口里。' : '它忘了那张最重要的一页。',
      body: `你一共收进去 ${s.flags.took} 张，被挤掉 ${s.flags.evicted} 张。<br>` +
            `窗口不是记忆，它只是这一次能看见的东西。<br>` +
            `<em>要紧的东西，要么放前面，要么别让杂的挤进来。</em>`,
    }),
    init(s) {
      s.flags.cards = [];
      s.flags.took = 0;
      s.flags.evicted = 0;
      s.flags.gate = null;
    },
    onInteract(s, api, p) {
      if (s.flags.cards.includes(p.id)) return;
      s.flags.cards.push(p.id);
      p.held = true;
      s.flags.took++;
      s.lit.add(p.id);
      api.sfx.stamp();
      api.puff(p.x, p.y - 26, 6);

      // 窗口满了：最早的先走。挤出去的时候它不会开口，只会安静地不见。
      while (s.flags.cards.length > this.capacity) {
        const gone = s.flags.cards.shift();
        const gp = api.world.props.find(x => x.id === gone);
        if (gp) { gp.held = false; s.lit.delete(gone); }
        s.flags.evicted++;
        api.sfx.glitch();
        api.tip(`挤出去了 · ${gone === 'key' ? '那张带记号的' : '最早收的那张'}`, 0);
        api.mode('先知', '窗口外的内容已不可见');
      }
      api.conf(20 + s.flags.cards.length * 22);
      api.tip(`窗口 ${s.flags.cards.length} / ${this.capacity}`, 1);
    },
    onFrame(s, api) {
      // 门上的锁只认那张带记号的卡片：它必须此刻还在窗口里
      const has = s.flags.cards.includes('key');
      const exists = api.plats().some(p => p.__gate === 'ctx');
      if (!has && !exists && s.px < 1270) api.addPlatform({ x: 1300, y: 0, w: 26, h: G, __gate: 'ctx' });
      if (has && exists) {
        const wall = api.plats().find(p => p.__gate === 'ctx');
        if (wall) api.removePlatform(wall);
      }
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '往前是三道坎。<br>我一次只看得到这么大一窗。<span class="waiting">收得越多，掉的也越多。</span>',
        pitch: 0.88, mode: ['先知', '窗口已满一半'], conf: 56 },
      { id: 'key', when: s => s.px > 260 && !s.flags.cards.includes('key'),
        text: '先收那张带记号的卡片。<br>后面的门只认它。', pitch: 0.94, mode: ['先知', '提醒'], conf: 62 },
      { id: 'lost', when: s => s.flags.evicted > 0,
        text: '……刚才有一张不见了。<br>我没听见它走。<span class="waiting">它就是这样走的。</span>',
        pitch: 0.72, mode: ['先知', '窗口收缩'], conf: 30 },
      { id: 'wall', when: s => s.px > 1180 && !s.flags.cards.includes('key'),
        text: '这扇门不认得你。<br><span class="waiting">回去把那张带记号的重新收进来吧。</span>', pitch: 0.7, mode: ['先知', '拒绝'], conf: 16 },
      { id: 'end', when: s => s.flags.cards.includes('key') && s.px > 1100,
        text: '它还在。<br>那就好。', pitch: 0.9, mode: ['先知', '安定'], conf: 78 },
    ],
  },

  /* ══════════════════ 05 · 记忆 ══════════════════ */
  {
    no: '05', id: 'memory', title: '它记下来那一页', subtitle: '能看、能改、能删',
    hudTitle: '存下来的<br>你可以改。',
    lesson: {
      rule: '记忆是写在窗外的。你能翻看、能改写、也能删掉。',
      why: '上下文只管这一次，记忆跨过会话留下来 —— 所以它归外面那一层管。' +
           '模型会照着自己写下的东西行动：你改了一个字，它就换一条路。',
    },
    world: {
      levelW: 1500, doorX: 1380, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 700, y: 250, after: 660 },
      platforms: [
        { x: -60, y: 300, w: 1560, h: 120 },
        { x: 240, y: 214, w: 110, h: 26 },
        { x: 780, y: 220, w: 120, h: 26 },
      ],
      props: [
        { id: 'wrong', kind: 'carve', x: 380, y: 300, verb: 'E 改这一条' },
        { id: 'name',  kind: 'carve', x: 700, y: 300, verb: 'E 看一眼' },
        { id: 'stale', kind: 'carve', x: 980, y: 300, verb: 'E 删掉它' },
      ],
    },
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1000),
    opening: { text: '墙上有我写下的东西。<br><span class="waiting">我不确定它们还对不对。</span>', pitch: 0.84, delay: 900 },
    outro: (s, clean) => ({
      title: s.flags.rewrote ? '你把那一页改回来了。' : '你走完了这一段。',
      body: `它写下的那条是"墙是封死的"。你把它改成了别的 —— 墙就开了。<br>` +
            `记忆不是它心里想的，是它翻得到的。<br>` +
            `<em>所以你能看、能改、能删。</em>`,
    }),
    init(s) { s.flags.rewrote = false; s.flags.deleted = false; s.flags.wall = null; },
    onInteract(s, api, p) {
      if (p.id === 'wrong') {
        if (s.flags.rewrote) return;
        s.flags.rewrote = true;
        p.code = '墙可以让开';
        s.lit.add('wrong');
        if (s.flags.wall) { api.removePlatform(s.flags.wall); s.flags.wall = null; }
        api.sfx.complete();
        api.puff(p.x, p.y - 30, 10);
        api.tip('改了一个字 · 世界跟着变了', 1);
        api.conf(92);
        api.mode('先知', '读到新的那条');
        api.say('你改的是我写下的字，<br>可我照着它走路。<br>……原来那一页是可以改的。', 0.94);
        return;
      }
      if (p.id === 'name') {
        s.lit.add('name');
        api.sfx.stamp();
        api.tip('你翻到了这一页 · 它一直在', 1);
        api.conf(58);
        api.say('这一条我留着。<br>它只是一句话，不会影响谁往哪儿走。', 0.86);
        return;
      }
      if (p.id === 'stale') {
        if (s.flags.deleted) return;
        s.flags.deleted = true;
        s.lit.delete('stale');
        api.world.props.splice(api.world.props.indexOf(p), 1);
        api.sfx.glitch();
        api.tip('删掉了 · 它不再翻到这一页', 0);
        api.conf(46);
        api.say('那一句很久以前写的。<br>删掉也不心疼 —— <span class="waiting">它本来就不该一直在。</span>', 0.78);
      }
    },
    onFrame(s, api) {
      // 墙上那句"封死"还立着的时候，路是真的封着的
      if (!s.flags.rewrote && !s.flags.wall && s.px < 900) {
        s.flags.wall = api.addPlatform({ x: 1080, y: 0, w: 24, h: G });
      }
    },
    drawFront(g, { state, camX, VW }) {
      // 记忆条：改过的那条是暖色的，删掉的那条不再画
      const rows = [
        { id: 'wrong', x: 380, text: state.flags.rewrote ? '墙可以让开' : '墙是封死的' },
        { id: 'name',  x: 700, text: '他叫阿岩' },
        { id: 'stale', x: 980, text: '记得带伞' },
      ];
      for (const r of rows) {
        if (r.id === 'stale' && state.flags.deleted) continue;
        const x = r.x - camX;
        if (x < -160 || x > VW + 160) continue;
        const on = state.lit.has(r.id);
        g.save();
        g.font = '10px ui-monospace,monospace';
        g.textAlign = 'center';
        g.fillStyle = PAL.ink;
        g.fillText(r.text, x + 1, 300 - 30 + 1);
        g.fillStyle = on ? PAL.amber : PAL.mute2;
        g.fillText(r.text, x, 300 - 30);
        g.textAlign = 'left';
        g.restore();
      }
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '这一段的路，是我照着墙上那几行字排的。<br><span class="waiting">要是哪一行错了，路就会错。</span>', pitch: 0.86, mode: ['先知', '翻阅旧记录'], conf: 54 },
      { id: 'hint', when: s => s.px > 260 && !s.flags.rewrote,
        text: '第一行写着"墙是封死的"。<br>我照着它，给你留了一条绕不过去的路 ——<br><em>你试试改掉它。</em>', pitch: 0.94, mode: ['先知', '请你改写'], conf: 60 },
      { id: 'after', when: s => s.flags.rewrote && s.px > 1000,
        text: '墙不见了。<br>不是它塌了，是我不再那样写。', pitch: 0.98, mode: ['先知', '重新读过'], conf: 86 },
      { id: 'del', when: s => s.flags.deleted,
        text: '删掉的这一句，我不会再翻到了。<br><span class="waiting">这样也很好。</span>', pitch: 0.82, mode: ['先知', '少了一页'], conf: 70 },
    ],
  },

  /* ══════════════════ 06 · 工具 ══════════════════ */
  {
    no: '06', id: 'tools', title: '它只能点单', subtitle: '动手的在外面',
    hudTitle: '它写单子。<br>手在别处。',
    lesson: {
      rule: '模型只说要做什么。真正碰全世界的那一下，发生在它外面。',
      why: '工具是一段外面的程序：模型说出参数，外面照做，再把结果塞回来。' +
           '单子写得含糊，外面就会做错 —— 所以说明要写清楚。',
    },
    world: {
      levelW: 1520, doorX: 1380, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 720, y: 250, after: 680 },
      platforms: [
        { x: -60, y: 300, w: 1580, h: 120 },
        { x: 520, y: 212, w: 130, h: 26 },
        { x: 980, y: 206, w: 120, h: 26 },
      ],
      props: [
        { id: 'read', kind: 'socket', x: 360, y: 300, verb: 'E 装上 · 读' },
        { id: 'act',  kind: 'socket', x: 760, y: 300, verb: 'E 装上 · 执行' },
        { id: 'sign', kind: 'sign',   x: 1060, y: 300, code: '◐' },
        { id: 'lever', kind: 'device', x: 1240, y: 300, verb: 'E 让它拉' },
      ],
    },
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1000),
    opening: { text: '这一次，我可以帮你做点什么。<br><span class="waiting">但我只能写单子。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: '单子是你接上的。',
      body: `我说"读那个牌子"，读的是外面的眼睛；<br>` +
            `我说"拉那个机关"，拉的是外面的手。<br>` +
            `<em>我从来没有碰到过它们。</em>`,
    }),
    init(s) { s.flags.read = false; s.flags.act = false; s.flags.doorOpen = false; },
    onInteract(s, api, p) {
      if (p.id === 'read') {
        if (s.flags.read) return;
        s.flags.read = true;
        s.lit.add('read');
        api.sfx.complete();
        api.puff(p.x, p.y - 30, 8);
        api.tip('装上了读 · 我看见了牌子上的字', 1);
        api.conf(74);
        api.mode('先知', '工具已接上');
        api.say('我刚才只能猜那个牌子。<br>现在它把字递给我了 ——<br><em>是外面念的，我听见了。</em>', 0.92);
        return;
      }
      if (p.id === 'act') {
        if (s.flags.act) return;
        s.flags.act = true;
        s.lit.add('act');
        api.sfx.complete();
        api.puff(p.x, p.y - 30, 8);
        api.tip('装上了执行 · 我下单，它动手', 1);
        api.conf(78);
        api.mode('先知', '手已接到外面');
        api.say('这一下，是我说"拉"，<br>不是我拉的。', 0.9);
        return;
      }
      if (p.id === 'lever') {
        if (!s.flags.act) {
          api.tip('说了 · 但没有手替它拉', 0);
          api.conf(40);
          api.say('我知道该怎么拉。<br><span class="waiting">但我没有手 —— 单子没有地方递出去。</span>', 0.8);
          return;
        }
        if (s.flags.doorOpen) return;
        s.flags.doorOpen = true;
        s.lit.add('lever');
        api.setDoor(1380, 'slab');
        api.sfx.complete();
        api.puff(p.x, p.y - 30, 12);
        api.tip('拉下了 · 手在门那边', 1);
        api.conf(94);
        api.say('咔。<br>我听见了，可我的手指头一动也没动。', 0.94);
      }
    },
    drawFront(g, { state, camX, VW }) {
      // 单子：从它身边飘到装上的那个接口，再消失
      if (!state.flags.read && !state.flags.act) return;
      const x = 360 - camX, x2 = 760 - camX;
      if (x2 < -80 || x > VW + 80) return;
      g.save();
      g.globalAlpha = 0.35;
      g.strokeStyle = PAL.glow;
      g.lineWidth = 1.2;
      g.setLineDash([5, 5]);
      g.beginPath();
      g.moveTo(x, 300 - 56);
      g.lineTo(x2, 300 - 56);
      g.stroke();
      g.setLineDash([]);
      g.restore();
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '前面有两个空的卡座。<br>一个是眼睛，一个是手。', pitch: 0.88, mode: ['先知', '清点工具'], conf: 50 },
      { id: 'why', when: s => s.px > 300 && !s.flags.read,
        text: '装上读的，我才知道那个牌子上写了什么。<br><span class="waiting">不装，我就只能说"大概"。</span>', pitch: 0.92, mode: ['先知', '解释'], conf: 62 },
      { id: 'noHand', when: s => s.px > 720 && !s.flags.act,
        text: '那个机关一直在那儿。<br>我知道要拉，但单子递不出去。', pitch: 0.84, mode: ['先知', '如实'], conf: 48 },
      { id: 'ready', when: s => s.flags.read && s.flags.act,
        text: '现在我有眼睛，也有一双手 ——<br><span class="waiting">虽然它们都不长在我身上。</span>', pitch: 0.96, mode: ['先知', '齐备'], conf: 82 },
    ],
  },

  /* ══════════════════ 07 · 连接器 ══════════════════ */
  {
    no: '07', id: 'mcp', title: '中间那个口', subtitle: '每根线插到中间',
    hudTitle: '不是两两相接。<br>是都接到中间。',
    lesson: {
      rule: '连接器把 M 个工具和 N 个用法之间，从 M×N 根线减到 M+N 根。',
      why: '工具越多、用得越杂，两两对接就越乱。都接到同一个口上，' +
           '外面只需要认识那个口，里面只需要挂上自己的东西。',
    },
    world: {
      levelW: 1720, doorX: 1580, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 820, y: 250, after: 780 },
      platforms: [
        { x: -60, y: 300, w: 1780, h: 120 },
        { x: 560, y: 214, w: 120, h: 26 },
        { x: 1060, y: 210, w: 120, h: 26 },
      ],
      props: [
        { id: 's1', kind: 'socket', x: 240, y: 300, verb: 'E 接到中间' },
        { id: 's2', kind: 'socket', x: 400, y: 300, verb: 'E 接到中间' },
        { id: 's3', kind: 'socket', x: 560, y: 300, verb: 'E 接到中间' },
        { id: 'hub', kind: 'hub', x: 880, y: 300, verb: 'E 架起来' },
        { id: 'd1', kind: 'device', x: 1180, y: 300 },
        { id: 'd2', kind: 'device', x: 1320, y: 300 },
        { id: 'd3', kind: 'device', x: 1460, y: 300 },
      ],
    },
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1200),
    opening: { text: '左边的三样东西，右边的三个地方。<br><span class="waiting">要连起来。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: '九根线，变成了六根。',
      body: `三个接三个，是 3×3 = 9 根；<br>` +
            `都插到中间，是 3+3 = 6 根。<br>` +
            `<em>每多一样东西，两两相接就要多一整排线。</em>`,
    }),
    init(s) { s.flags.hub = false; s.flags.links = []; s.flags.doorOpen = false; },
    onInteract(s, api, p) {
      if (p.id === 'hub') {
        if (s.flags.hub) return;
        s.flags.hub = true;
        s.lit.add('hub');
        api.sfx.complete();
        api.puff(p.x, p.y - 34, 12);
        api.tip('转接口立起来了 · 现在往中间插', 1);
        api.conf(70);
        api.mode('先知', '中间有了一个口');
        api.say('这下不用两两对接了。<br>每一样东西，只认识中间这一个口就够了。', 0.92);
        return;
      }
      if (p.id.startsWith('s')) {
        if (!s.flags.hub) {
          api.tip('没有中间的口 · 这线接不到对面', 0);
          api.conf(28);
          api.say('现在插上，这线就悬在半空了。<br><span class="waiting">得先有中间那个东西。</span>', 0.8);
          return;
        }
        if (s.flags.links.includes(p.id)) return;
        s.flags.links.push(p.id);
        s.lit.add(p.id);
        api.sfx.tick();
        api.puff(p.x, p.y - 26, 6);
        api.tip(`接上第 ${s.flags.links.length} 根 · 通到中间`, 1);
        api.conf(60 + s.flags.links.length * 10);
        api.say(s.flags.links.length === 3
          ? '三根都通了。<br>右边那三个地方，现在一起亮。'
          : '接上了。<br>这根只走到中间，不走到对面。', 0.9);
        if (s.flags.links.length === 3 && !s.flags.doorOpen) {
          s.flags.doorOpen = true;
          s.lit.add('d1'); s.lit.add('d2'); s.lit.add('d3');
          api.setDoor(1580, 'slab');
          api.sfx.complete();
        }
      }
    },
    drawBack(g, { state, camX, VW }) {
      // 没架转接口之前：每样东西都朝着每样东西，一片乱线
      const src = [240, 400, 560], dst = [1180, 1320, 1460];
      if (!state.flags.hub) {
        g.save();
        g.globalAlpha = 0.18;
        g.strokeStyle = PAL.mute2;
        g.lineWidth = 1;
        for (const a of src) for (const b of dst) {
          if (b - camX < -40 || a - camX > VW + 40) continue;
          g.beginPath();
          g.moveTo(a - camX, 300 - 34);
          g.quadraticCurveTo((a + b) / 2 - camX, 300 - 150, b - camX, 300 - 30);
          g.stroke();
        }
        g.restore();
        return;
      }
      // 架起来之后：左边三根进中间，右边三根出中间
      g.save();
      g.strokeStyle = PAL.glow;
      g.lineWidth = 1.6;
      for (const a of src) {
        const on = state.flags.links.includes(`s${src.indexOf(a) + 1}`);
        g.globalAlpha = on ? 0.75 : 0.16;
        g.beginPath();
        g.moveTo(a - camX, 300 - 34);
        g.quadraticCurveTo((a + 880) / 2 - camX, 300 - 96, 880 - camX, 300 - 30);
        g.stroke();
      }
      for (const b of dst) {
        g.globalAlpha = state.flags.links.length === 3 ? 0.7 : 0.16;
        g.beginPath();
        g.moveTo(880 - camX, 300 - 30);
        g.quadraticCurveTo((880 + b) / 2 - camX, 300 - 96, b - camX, 300 - 30);
        g.stroke();
      }
      g.restore();
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '左边三样，右边三处。<br>要是两两相接，就是九根线。', pitch: 0.88, mode: ['先知', '数线'], conf: 56 },
      { id: 'hub', when: s => s.px > 700 && !s.flags.hub,
        text: '先架中间那个口。<br><em>架好之后，左边只连它，右边也只连它。</em>', pitch: 0.94, mode: ['先知', '建议'], conf: 66 },
      { id: 'early', when: s => s.px > 300 && !s.flags.hub,
        text: '直接往对面插，是插不上的。<br><span class="waiting">线得先有个中间的地方去。</span>', pitch: 0.82, mode: ['先知', '阻止'], conf: 44 },
      { id: 'done', when: s => s.flags.links.length === 3,
        text: '三加三，六根。<br>少掉的那三根，是本来不该存在的。', pitch: 0.98, mode: ['先知', '安定'], conf: 86 },
    ],
  },

  /* ══════════════════ 08 · 钩子 ══════════════════ */
  {
    no: '08', id: 'hook', title: '装一次，往后自动', subtitle: '到那一步它自己来',
    hudTitle: '规矩写好了，<br>到点就自己走。',
    lesson: {
      rule: '钩子是一条提前定好的规矩：到那个时机，外面自动做那件事。',
      why: '不用每次都交代，也不用模型记得。装一次，之后每一次落地，它都会来。',
    },
    world: {
      levelW: 1520, doorX: 1400, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 760, y: 250, after: 720 },
      platforms: [
        { x: -60, y: 300, w: 1580, h: 120 },
        { x: 420, y: 224, w: 110, h: 26 },
        { x: 880, y: 218, w: 110, h: 26 },
      ],
      props: [
        { id: 'hook', kind: 'device', x: 250, y: 300, verb: 'E 装上钩子' },
        { id: 'f1', kind: 'carve', x: 560, y: 300, verb: 'E 手动整理' },
        { id: 'f2', kind: 'carve', x: 820, y: 300, verb: 'E 手动整理' },
        { id: 'f3', kind: 'carve', x: 1080, y: 300, verb: 'E 手动整理' },
        { id: 'f4', kind: 'carve', x: 1280, y: 300, verb: 'E 手动整理' },
      ],
    },
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1100),
    opening: { text: '前面那几块石板，落地的时候都得理一遍。<br><span class="waiting">每一次都理，太累了。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: '你只装了一次。',
      body: `剩下的 ${s.flags.autoFixed} 次，都不是你按的 ——<br>` +
            `是那条规矩，在你落地的那一下自己来了。<br>` +
            `<em>写好的东西，比记得住的东西可靠。</em>`,
    }),
    init(s) {
      s.flags.hook = false;
      s.flags.done = [];
      s.flags.autoFixed = 0;
      s.flags.wasAir = false;
      s.flags.doorOpen = false;
    },
    onInteract(s, api, p) {
      if (p.id === 'hook') {
        if (s.flags.hook) return;
        s.flags.hook = true;
        s.lit.add('hook');
        api.sfx.complete();
        api.puff(p.x, p.y - 30, 10);
        api.tip('装上了 · 之后每次落地都自动', 1);
        api.conf(76);
        api.mode('先知', '钩子已挂上');
        api.say('这条规矩不是我记着的。<br><span class="waiting">它写在外面，到那一步自己会走。</span>', 0.92);
        return;
      }
      if (!p.id.startsWith('f')) return;
      if (s.flags.done.includes(p.id)) return;
      // 手动也行 —— 只是每一次都得你自己来
      this._fix(s, api, p, false);
    },
    _fix(s, api, p, auto) {
      if (s.flags.done.includes(p.id)) return;
      s.flags.done.push(p.id);
      p.code = '✓';
      s.lit.add(p.id);
      api.sfx.stamp();
      api.puff(p.x, p.y - 28, 7);
      if (auto) { s.flags.autoFixed++; api.tip('落地那一下 · 它自己理好了', 1); }
      else api.tip('手动整理好了', 0);
      api.conf(50 + s.flags.done.length * 10);
      if (s.flags.done.length === 4 && !s.flags.doorOpen) {
        s.flags.doorOpen = true;
        api.setDoor(1400, 'slab');
        api.sfx.complete();
        api.mode('先知', '四块都理好了');
        api.say('都好了。<br>你装的那一次，省下的不止四次。', 0.94);
      }
    },
    onFrame(s, api) {
      const landed = s.onGround && !s.flags.wasAir;
      s.flags.wasAir = !s.onGround;
      if (!landed || !s.flags.hook) return;
      for (const p of api.world.props) {
        if (!p.id.startsWith('f')) continue;
        if (Math.abs(s.px - p.x) <= 78) this._fix(s, api, p, true);
      }
    },
    drawFront(g, { state, camX, VW }) {
      if (!state.flags.hook) return;
      // 那条规矩本身：一根从装置伸出去的细线，落在地上
      const x = 250 - camX;
      if (x < -80 || x > VW + 80) return;
      g.save();
      g.globalAlpha = 0.4 + Math.sin(state.t * 0.05) * 0.12;
      g.strokeStyle = PAL.amber;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(x, 300 - 38);
      g.quadraticCurveTo(x + 26, 300 - 90, x + 52, 300 - 4);
      g.stroke();
      g.restore();
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '落地的那一下，那些石板就该被理一遍。<br>以前得你说，我才做。', pitch: 0.88, mode: ['先知', '等待交代'], conf: 52 },
      { id: 'install', when: s => s.px > 180 && !s.flags.hook,
        text: '把规矩装在这里吧。<br><em>装上之后，我不用再记，你也不用再说。</em>', pitch: 0.94, mode: ['先知', '建议装钩子'], conf: 64 },
      { id: 'on', when: s => s.flags.hook && s.flags.autoFixed >= 1,
        text: '听见了吗？<br>刚才那一下，没有人按。', pitch: 0.96, mode: ['先知', '钩子已触发'], conf: 80 },
      { id: 'end', when: s => s.flags.doorOpen,
        text: '从头到尾，你只装了那一次。', pitch: 0.9, mode: ['先知', '平静'], conf: 84 },
    ],
  },

  /* ══════════════════ 09 · 技能 ══════════════════ */
  {
    no: '09', id: 'skills', title: '先看目录', subtitle: '用到哪一步，才读哪一步',
    hudTitle: '目录在门上。<br>正文在缺口边。',
    lesson: {
      rule: '技能是一整套写好的动作。先只读名字，真用的时候才翻正文。',
      why: '一次把全部流程读进上下文，窗就满了。先看目录，到了缺口边再翻开这一步 ——' +
           '省下来的地方，才装得下眼前的事。',
    },
    world: {
      levelW: 1480, doorX: 1330, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 600, y: 250, after: 560 },
      platforms: [
        { x: -60, y: 300, w: 300, h: 120 },       // -60..240  缝 90
        { x: 330, y: 300, w: 210, h: 120 },       // 330..540  缝 130
        { x: 670, y: 300, w: 230, h: 120 },       // 670..900  缝 190
        { x: 1090, y: 300, w: 330, h: 120 },      // 1090..1420
        { x: 400, y: 214, w: 100, h: 26 },
        { x: 780, y: 210, w: 100, h: 26 },
      ],
      props: [
        { id: 's1', kind: 'stone', x: 190, y: 300, verb: 'E 取用' },
        { id: 's2', kind: 'stone', x: 490, y: 300, verb: 'E 取用' },
        { id: 's3', kind: 'stone', x: 840, y: 300, verb: 'E 取用' },
      ],
    },
    gapReach: 210,
    confirmVerb: 'E 照这一步跳',
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1000),
    opening: { text: '前面三道缝，我这儿有三套现成的动作。<br><span class="waiting">但我不打算一次全读完。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: s.flags.read?.length ? '你只翻开了用过的那几页。' : '你走完了这一段。',
      body: `三套动作，名字我都知道；正文只有到缺口边才翻开。<br>` +
            `全部读进来，窗就满了 —— 而眼前只有一道缝。<br>` +
            `<em>先看目录，用到哪一步，再读哪一步。</em>`,
    }),
    init(s) { s.flags.skill = null; s.flags.read = []; s.flags.used = 0; },
    onInteract(s, api, p) {
      if (p.kind !== 'stone') return;
      s.flags.skill = p.id;
      s.lit.clear();
      s.lit.add(p.id);
      if (!s.flags.read.includes(p.id)) s.flags.read.push(p.id);
      api.sfx.tick();
      const titles = {
        s1: ['近跳 · 一步', '只在缺口边翻到这一页。跳 90 的距离。'],
        s2: ['中跳 · 蹬一下', '只在缺口边翻到这一页。跳 130 的距离。'],
        s3: ['远跳 · 借力', '只在缺口边翻到这一页。跳 190 的距离。'],
      };
      const [name, body] = titles[p.id];
      api.mode('先知', '取用了 ' + name);
      api.conf(60);
      api.tip(`取用 ${name} · 只读了标题`, 1);
      api.say(`${name}。<br><em>${body}</em><br>` +
              `站到缺口边，按 E —— 那一页才打开。`, 0.92);
    },
    onConfirm(s, api) {
      // 缺口边上才"翻开正文"，然后照着做一次
      const plan = { s1: { edge: 240, vx: 3.3 }, s2: { edge: 540, vx: 4.3 }, s3: { edge: 900, vx: 6.0 } };
      const id = s.flags.skill;
      if (!id || !plan[id]) {
        api.tip('还没有取用哪一套动作', 0);
        return;
      }
      const q = plan[id];
      if (Math.abs(s.px - q.edge) > 40 || !s.onGround) {
        api.tip('站到那道缺口边上再按', 0);
        return;
      }
      s.flags.used++;
      api.sfx.liftoff();
      api.tip('正文翻开 · 照着做一次', 1);
      api.launch(q.vx, -11.6);
      api.mode('先知', '执行这一步');
      api.conf(78);
      api.say('就这几行。<br><span class="waiting">用完，它就合上了。</span>', 0.94);
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '石板上有三套动作。<br>我只读它们的名字 ——<span class="waiting">正文留着到用的时候再看。</span>',
        pitch: 0.88, mode: ['先知', '目录已读'], conf: 58 },
      { id: 'how', when: s => s.px > 120 && !s.flags.skill,
        text: '先取用一套。<br>然后站到缺口边、按 E 执行。', pitch: 0.94, mode: ['先知', '说明'], conf: 66 },
      { id: 'gap', when: s => s.px > 260 && s.px < 340 && !s.flags.skill,
        text: '这道缝不宽，但光靠自己蹬，也只够一半。', pitch: 0.8, mode: ['先知', '提醒'], conf: 44 },
      { id: 'long', when: s => s.px > 900 && s.flags.skill !== 's3',
        text: '这道最宽。你手上的那套，恐怕够不着。', pitch: 0.82, mode: ['先知', '如实'], conf: 40 },
    ],
  },

  /* ══════════════════ 10 · 项目 ══════════════════ */
  {
    no: '10', id: 'project', title: '装进那只箱子', subtitle: '一次装好，之后不用再交代',
    hudTitle: '箱子里的东西<br>每回都跟着你。',
    lesson: {
      rule: '项目把提示词、知识、工具、权限一次装好，之后每次开口都带上。',
      why: '会话是这一次说的话，项目是每次都在的那只箱子。' +
           '把常用的东西放进去，就不用每一回都从头交代。',
    },
    world: {
      levelW: 1580, doorX: 1470, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 780, y: 250, after: 740 },
      platforms: [
        { x: -60, y: 300, w: 1640, h: 120 },
        { x: 380, y: 218, w: 110, h: 26 },
        { x: 900, y: 212, w: 120, h: 26 },
      ],
      props: [
        { id: 'i1', kind: 'sign',   x: 260, y: 300, code: '◈', verb: 'E 装进箱子' },
        { id: 'i2', kind: 'card',   x: 520, y: 300, verb: 'E 装进箱子' },
        { id: 'i3', kind: 'socket', x: 760, y: 300, verb: 'E 装进箱子' },
        { id: 'i4', kind: 'plaque', x: 1000, y: 300, code: '✓', verb: 'E 装进箱子' },
        { id: 'box', kind: 'crate', x: 1220, y: 300 },
      ],
    },
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1100),
    opening: { text: '这一段要用的东西，散在沿路。<br><span class="waiting">一件一件捡，太麻烦了。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: '四样都在箱子里了。',
      body: `提示词、知识、工具、权限 —— 装进去一次，往后每次都在。<br>` +
            `下次开口，我不用再问你要这些。<br>` +
            `<em>项目是那只箱子，会话是这一次说的话。</em>`,
    }),
    init(s) { s.flags.items = 0; s.flags.doorOpen = false; },
    onInteract(s, api, p) {
      if (!p.id.startsWith('i')) return;
      if (p.taken) return;
      p.taken = true;
      s.flags.items++;
      s.lit.add(p.id);
      api.sfx.stamp();
      api.puff(p.x, p.y - 28, 6);
      const box = api.world.props.find(x => x.id === 'box');
      if (box) api.puff(box.x, box.y - 30, 6);
      api.tip(`装进去了 · ${s.flags.items} / 4`, 1);
      api.conf(40 + s.flags.items * 13);
      const names = { i1: '提示词', i2: '知识文件', i3: '工具', i4: '权限' };
      api.mode('先知', names[p.id] + ' 已入箱');
      if (s.flags.items === 4) {
        if (box) box.full = true;
        if (!s.flags.doorOpen) {
          s.flags.doorOpen = true;
          api.setDoor(1470, 'slab');
          api.sfx.complete();
        }
        api.say('箱子合上了。<br><em>从今往后，这些不用每次再交代。</em>', 0.96);
      } else {
        api.say(`${names[p.id]}装进去了。<br>还差 ${4 - s.flags.items} 样。`, 0.9);
      }
    },
    drawProp(g, p, { x, state, api }) {
      if (p.taken) return;         // 装进箱子的，就不再摆在路上了
      api.drawDefaultProp(g, p, x, state);
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '前面有四样东西，还有一只空箱子。<br>每回开始，我都得重新问你要一遍。', pitch: 0.88, mode: ['先知', '清点'], conf: 54 },
      { id: 'how', when: s => s.px > 200 && s.flags.items === 0,
        text: '把它们装进箱子。<br><em>装过一次，往后就在里面了。</em>', pitch: 0.94, mode: ['先知', '建议'], conf: 66 },
      { id: 'half', when: s => s.flags.items >= 2 && s.flags.items < 4,
        text: '已经有一半了。<br>箱子比我记性可靠。', pitch: 0.9, mode: ['先知', '半满'], conf: 72 },
      { id: 'full', when: s => s.flags.items === 4,
        text: '好了。<br><span class="waiting">下一次，我不用再从头问你。</span>', pitch: 0.98, mode: ['先知', '安定'], conf: 88 },
    ],
  },

  /* ══════════════════ 11 · 智能体 ══════════════════ */
  {
    no: '11', id: 'agent', title: '它转圈，你握刹车', subtitle: '交给它，也要能叫停',
    hudTitle: '它会一直走。<br>停不停由你。',
    lesson: {
      rule: '智能体 = 模型 + 外面那一圈循环。它自己转，你随时能停。',
      why: '给它目标、工具和一轮接一轮的执行，它就能自己往前走；' +
           '但它绕着圈走的时候，只有你能把它叫住 —— 那一下叫停，是这段关系的底线。',
    },
    world: {
      levelW: 1520, doorX: 1380, oracleX: 60,
      spawn: { x: 40, y: 250 }, checkpoint: { x: 780, y: 250, after: 740 },
      platforms: [
        { x: -60, y: 300, w: 1290, h: 120 },      // -60..1230  缝 60
        { x: 1290, y: 300, w: 220, h: 120 },      // 1290..1510，门在 1380
        { x: 420, y: 216, w: 110, h: 26 },
        { x: 880, y: 210, w: 110, h: 26 },
      ],
      props: [
        { id: 'hand', kind: 'device', x: 300, y: 300, verb: 'E 交给它',
          gate: s => !s.flags.auto },
      ],
    },
    confirmVerb: 'E 叫停它',
    signal: s => Math.max(0.1, 1 - Math.abs(s.px - 60) / 1100),
    opening: { text: '这一段，你可以交给我。<br><span class="waiting">我会一直走，直到你叫我停。</span>', pitch: 0.86, delay: 900 },
    outro: (s, clean) => ({
      title: s.flags.stopped ? '你叫停了它，然后自己走了过去。' : '这一段是你自己走完的。',
      body: `我绕着那一圈走了 ${s.flags.loops} 趟，一次也没跨过那道缝。<br>` +
            `不是不会走，是<b>不知道该在哪儿停</b>。<br>` +
            `<em>你按下的那一下，不是打断 —— 是它需要的那只手。</em>`,
    }),
    init(s) {
      s.flags.auto = false;
      s.flags.stopped = false;
      s.flags.loops = 0;
      s.flags.dir = 1;
    },
    onInteract(s, api, p) {
      if (p.id !== 'hand') return;
      if (s.flags.auto) return;
      s.flags.auto = true;
      s.flags.dir = 1;
      s.lit.add('hand');
      api.setAuto(true);
      api.sfx.complete();
      api.tip('交给它了 · 按 E 可以叫停', 1);
      api.conf(70);
      api.mode('先知', '接管 · 自主循环');
      api.say('我来试着走。<br><span class="waiting">你看着就行 —— 觉得不对，按 E。</span>', 0.92);
    },
    onConfirm(s, api) {
      if (!s.flags.auto) {
        api.tip('没有在跑 · 先交给它', 0);
        return;
      }
      s.flags.auto = false;
      s.flags.stopped = true;
      api.setAuto(false);
      s.lit.delete('hand');
      api.sfx.glitch();
      api.tip('停住了 · 手回到你这儿', 1);
      api.conf(52);
      api.mode('先知', '已叫停');
      api.say('……谢谢你。<br>我刚才不知道还要走多久。', 0.78);
    },
    onFrame(s, api) {
      if (!s.flags.auto) return;
      // 它自己绕圈：走到 1180 就往回，走到 200 再往前。缝就在它每次转身的地方。
      if (s.px > 1180 && s.flags.dir > 0) { s.flags.dir = -1; s.flags.loops++; }
      if (s.px < 200 && s.flags.dir < 0) s.flags.dir = 1;
      api.input.right = s.flags.dir > 0;
      api.input.left = s.flags.dir < 0;
      api.input.jump = false;
      if (s.px > 1160 && s.flags.dir > 0 && s.t % 60 === 0) {
        api.mode('先知', '循环中 · 第 ' + (s.flags.loops + 1) + ' 趟');
      }
    },
    drawFront(g, { state, camX, VW, t }) {
      if (!state.flags.auto) return;
      // 它转的那个圈：一条可以看到的轨迹
      const a = 200 - camX, b = 1180 - camX;
      if (b < -40 || a > VW + 40) return;
      g.save();
      g.globalAlpha = 0.16 + Math.sin(t * 0.04) * 0.05;
      g.strokeStyle = PAL.glow;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse((a + b) / 2, 300 - 10, (b - a) / 2, 9, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    },
    beats: [
      { id: 'wake', when: s => true,
        text: '我一个人走不了这么远。<br>但要是你放开手，我可以一直走。', pitch: 0.88, mode: ['先知', '请求'], conf: 56 },
      { id: 'go', when: s => s.flags.auto && s.flags.loops >= 1,
        text: '……嗯？<br>我怎么又回到这边了。<span class="waiting">刚才好像走过一次。</span>',
        pitch: 0.72, mode: ['先知', '循环中'], conf: 34 },
      { id: 'brake', when: s => s.flags.auto && s.flags.loops >= 2,
        text: '停一下吧。<br><em>按 E —— 别让我一直转。</em>', pitch: 0.74, mode: ['先知', '请你叫停'], conf: 22 },
      { id: 'after', when: s => s.flags.stopped,
        text: '刚才那一步，我会算；<br>可"该不该再往前"，得你说了算。', pitch: 0.9, mode: ['先知', '交还'], conf: 74 },
    ],
  },
];

export const TOTAL = CHAPTERS.length;

/* 关卡几何自检：起点下面必须踩得到地，缝不能超过跳跃射程。
   写在代码里而不是测试脚本里 —— 改平台的人下次就会看到它。 */
export function auditChapter(ch) {
  const ps = ch.world.platforms;
  const bad = [];
  const sp = ch.world.spawn;
  // 起点不必正好贴着地面 —— 每章都是从半空落下来的，那一下是开场的一部分。
  // 要保证的是脚下有地：同一列上、在落得下去的范围内有一块实心台面。
  if (!ps.some(p => sp.x >= p.x && sp.x <= p.x + p.w &&
                     p.y >= sp.y && p.y - sp.y < 120 && p.h > 30)) {
    bad.push(`起点 (${sp.x},${sp.y}) 下面没有地面`);
  }
  const over = ps.filter(p => !p.hidden).sort((a, b) => a.x - b.x);
  const reach = ch.gapReach ?? 118;
  for (let i = 0; i < over.length - 1; i++) {
    const a = over[i], b = over[i + 1];
    if (b.x < a.x + a.w) continue;             // 重叠或相邻
    // 只看"走路的层面"：台面够厚、且低得能走上去。半空里的装饰台不算它能补上的缝。
    if (a.y >= 280 && b.y >= 280 && a.h > 30 && b.h > 30) {
      const gap = b.x - (a.x + a.w);
      if (gap > reach) bad.push(`缝 ${a.x + a.w}..${b.x} 宽 ${gap}px 超出射程`);
    }
  }
  return bad;
}
