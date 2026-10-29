/* 漫画过场：五个分镜，整屏推进。
   锐利漫画风格 —— 硬边、粗描边、速度线、冷色调。 */

const PANELS_CH1 = [
  {
    id: 'fall',
    cap: { text: '你从一个不存在的楼梯拐角，跌了下去。', cls: 'cap zh', style: 'left:8%;bottom:14%;max-width:44%' },
    art: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <rect width="1600" height="900" fill="#11171c"/>
        <g stroke="#0b0f12" stroke-width="7" stroke-linejoin="round">
          <!-- 极端透视的楼梯井 -->
          <path d="M-100 900L300 120 520 120 260 900Z" fill="#1d2830"/>
          <path d="M520 120L760 120 620 900 260 900Z" fill="#11171c"/>
          <path d="M760 120L960 120 900 900 620 900Z" fill="#182028"/>
          <!-- 台阶，越往上越密 -->
          <g fill="#26343d">
            <path d="M300 120L520 120 512 178 -8 178Z" stroke="#0b0f12" stroke-width="5"/>
            <path d="M286 200L536 200 528 262 246 262Z"/>
            <path d="M236 288L548 288 540 354 216 354Z"/>
            <path d="M186 384L562 384 552 454 164 454Z"/>
            <path d="M132 486L578 486 566 560 110 560Z"/>
            <path d="M74 598L594 598 582 676 52 676Z"/>
            <path d="M18 714L612 714 598 800 -10 800Z"/>
          </g>
          <!-- 顶部透出的一线光 -->
          <path d="M300 120L520 120 500 60 320 60Z" fill="#8fd4e8" opacity=".85"/>
        </g>
        <!-- 下坠的人形剪影 -->
        <g transform="translate(1150 430) rotate(14)" stroke="#0b0f12" stroke-width="6" stroke-linejoin="round">
          <path d="M0 0L26 6 30 44 -4 40Z" fill="#dfe7e9"/>
          <circle cx="12" cy="-24" r="19" fill="#dfe7e9"/>
          <path d="M2 38L-22 78M24 42L46 82M6 -2L-26 24M26 4L56 26" fill="none"/>
          <path d="M-30 18L-58 4" fill="none"/>
        </g>
        <!-- 速度线 -->
        <g stroke="#8fd4e8" stroke-width="4" opacity=".55">
          <path d="M1000 250L1330 210M1040 330L1400 286M1020 520L1370 566M1080 640L1420 690M960 720L1300 780"/>
        </g>
        <g stroke="#dfe7e9" stroke-width="2" opacity=".3">
          <path d="M180 120L140 420M1220 90L1260 380M700 40L700 300"/>
        </g>
        <!-- 边框内阴影，模拟画格 -->
        <rect x="14" y="14" width="1572" height="872" fill="none" stroke="#0b0f12" stroke-width="28"/>
      </svg>`
  },
  {
    id: 'world',
    cap: null,
    art: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <rect width="1600" height="900" fill="#182028"/>
        <!-- 异度空间：悬浮的巨构 -->
        <g stroke="#0b0f12" stroke-width="6" stroke-linejoin="round">
          <path d="M120 0L340 640 200 900 -80 900Z" fill="#26343d"/>
          <path d="M340 640L470 900 200 900Z" fill="#11171c"/>
          <path d="M1200 0L1050 560 1180 900 1500 900Z" fill="#1d2830"/>
          <path d="M1050 560L900 900 1180 900Z" fill="#11171c"/>
          <!-- 悬浮石板 -->
          <g fill="#9fb0b8">
            <path d="M600 300L820 262 940 320 720 362Z"/>
            <path d="M560 430L780 392 900 450 680 492Z"/>
            <path d="M520 560L740 522 860 580 640 622Z"/>
            <path d="M480 690L700 652 820 710 600 752Z"/>
          </g>
          <g fill="#7d8c94">
            <path d="M600 300L720 362 720 396 600 336Z"/>
            <path d="M560 430L680 492 680 526 560 466Z"/>
            <path d="M520 560L640 622 640 656 520 596Z"/>
            <path d="M480 690L600 752 600 786 480 726Z"/>
          </g>
          <!-- 不可能的门 -->
          <rect x="700" y="96" width="180" height="260" fill="#0b0f12" stroke="#8fd4e8" stroke-width="5"/>
          <rect x="716" y="112" width="148" height="228" fill="#8fd4e8" opacity=".2"/>
        </g>
        <g stroke="#9fb0b8" stroke-width="1.5" opacity=".28">
          <path d="M0 300H1600M0 600H1600M400 0V900M1200 0V900"/>
        </g>
        <rect x="14" y="14" width="1572" height="872" fill="none" stroke="#0b0f12" stroke-width="28"/>
      </svg>`
  },
  {
    id: 'oracle',
    cap: { text: '它自称「先知」。', cls: 'cap block', style: 'left:50%;top:74%;transform:translate(-50%,-50%)' },
    art: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <rect width="1600" height="900" fill="#11171c"/>
        <!-- 聚焦的放射线，漫画式强调 -->
        <g stroke="#26343d" stroke-width="3">
          ${Array.from({ length: 90 }, (_, i) => {
            const a = (i / 90) * Math.PI * 2;
            return `<path d="M800 450L${800 + Math.cos(a) * 1600} ${450 + Math.sin(a) * 1600}"/>`;
          }).join('')}
        </g>
        <!-- 悬浮多面镜体 -->
        <g transform="translate(800 450)" stroke="#0b0f12" stroke-width="8" stroke-linejoin="round">
          <path d="M0-200L124 0 0 200-124 0Z" fill="#1d2830"/>
          <path d="M0-200L0 0-124 0Z" fill="#9fb0b8"/>
          <path d="M0-200L124 0 0 0Z" fill="#5a6c76"/>
          <path d="M-124 0L0 0 0 200Z" fill="#3d4d57"/>
          <path d="M124 0L0 0 0 200Z" fill="#11171c"/>
          <path d="M-56-56L56 56M-56 56L56-56" stroke="#b6d8e4" stroke-width="6" opacity=".85"/>
        </g>
        <circle cx="800" cy="450" r="240" fill="#8fd4e8" opacity=".13"/>
        <circle cx="800" cy="450" r="150" fill="#8fd4e8" opacity=".16"/>
        <!-- 台词气泡：身子和尾巴是一条闭合的线，不拼缝。
             尾巴从左边顶端伸出去，指向那面镜子 —— 不是脚下。 -->
        <path d="M1096 586H1452V714H1096V682L1000 656L1096 630Z"
          fill="#dfe7e9" stroke="#0b0f12" stroke-width="7" stroke-linejoin="round"/>
        <text x="1290" y="634" font-family="monospace" font-size="26" fill="#0b0f12" text-anchor="middle">可以帮你</text>
        <text x="1290" y="674" font-family="monospace" font-size="26" fill="#0b0f12" text-anchor="middle">但请先告诉我</text>
        <rect x="14" y="14" width="1572" height="872" fill="none" stroke="#0b0f12" stroke-width="28"/>
      </svg>`
  },
  {
    id: 'blind',
    cap: { text: '它知道这个世界的传说。<br>但它看不见你站在哪里。', cls: 'cap zh', style: 'left:8%;top:12%;max-width:50%' },
    art: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <rect width="1600" height="900" fill="#182028"/>
        <!-- 上半：先知能看见的部分（清晰） -->
        <g opacity="1">
          <rect x="0" y="0" width="1600" height="420" fill="#1d2830"/>
          <g stroke="#8fd4e8" stroke-width="3" fill="none" opacity=".7">
            <path d="M120 340L360 200 620 320 900 180 1180 300 1440 190"/>
          </g>
          <g fill="#8fd4e8" font-family="monospace" font-size="22" text-anchor="end">
            <text x="1470" y="330">十一座塔 · 传说 · 门后的世界</text>
            <text x="1470" y="374" fill="#b6d8e4" font-size="19">已知：371 条</text>
          </g>
        </g>
        <!-- 下半：它看不见的部分（噪点/空白） -->
        <rect x="0" y="420" width="1600" height="480" fill="#0b0f12"/>
        <g stroke="#26343d" stroke-width="2">
          ${Array.from({ length: 40 }, (_, i) => `<path d="M${i * 41} 420V900"/>`).join('')}
          ${Array.from({ length: 16 }, (_, i) => `<path d="M0 ${420 + i * 31}H1600"/>`).join('')}
        </g>
        <text x="800" y="680" font-family="monospace" font-size="30" fill="#c4553f" text-anchor="middle">▚ 无法读取当前位置</text>
        <!-- 分界粗线 -->
        <path d="M0 420H1600" stroke="#dfe7e9" stroke-width="9"/>
        <rect x="14" y="14" width="1572" height="872" fill="none" stroke="#0b0f12" stroke-width="28"/>
      </svg>`
  },
  {
    id: 'hand',
    cap: { text: '镜片落在你手边。', cls: 'cap zh', style: 'right:8%;bottom:16%;max-width:40%;text-align:right' },
    art: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <rect width="1600" height="900" fill="#11171c"/>
        <!-- 极近距离的手与镜片，漫画大特写 -->
        <g stroke="#0b0f12" stroke-width="7" stroke-linejoin="round">
          <path d="M420 900L440 620 520 560 620 570 700 610 760 660 780 900Z" fill="#9fb0b8"/>
          <g fill="none" stroke="#0b0f12" stroke-width="6">
            <path d="M470 640L500 520M540 620L570 500M620 630L648 512M690 660L712 546"/>
          </g>
          <!-- 掌心的镜片 -->
          <g transform="translate(600 640) rotate(-8)">
            <path d="M0-74L46 0 0 74-46 0Z" fill="#1d2830"/>
            <path d="M0-74L0 0-46 0Z" fill="#9fb0b8"/>
            <path d="M0-74L46 0 0 0Z" fill="#5a6c76"/>
            <path d="M-46 0L0 0 0 74Z" fill="#3d4d57"/>
            <path d="M46 0L0 0 0 74Z" fill="#11171c"/>
          </g>
        </g>
        <circle cx="600" cy="640" r="130" fill="#8fd4e8" opacity=".2"/>
        <!-- 放射强调线 -->
        <g stroke="#8fd4e8" stroke-width="4" opacity=".6">
          ${Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x1 = 600 + Math.cos(a) * 150, y1 = 640 + Math.sin(a) * 150;
            const x2 = 600 + Math.cos(a) * 230, y2 = 640 + Math.sin(a) * 230;
            return `<path d="M${x1} ${y1}L${x2} ${y2}"/>`;
          }).join('')}
        </g>
        <rect x="14" y="14" width="1572" height="872" fill="none" stroke="#0b0f12" stroke-width="28"/>
      </svg>`
  }
];

/* ── 每章的过场 ──
   序章那五格讲的是"你掉进来了"。后面每一章的过场只干一件事：
   在你亲手做之前，先把这一章的机制画成一个你记得住的画面。
   不解释道理 —— 道理在结算卡里。过场只负责让你进门时是懵的、
   出来时是懂的，中间的差值就是那一章。

   版式：1600×900 的整页，切成两三格，格与格之间是墨色的槽。
   每一格自己是一个嵌套 <svg>，所以格里的坐标可以独立算，
   格内画出界也只会被它自己的框裁掉 —— 这是分格，不是贴图。 */

const INK = '#0b0f12', INK2 = '#11171c', INK3 = '#182028';
const PAPER = '#dfe7e9', MUTE = '#9fb0b8', MUTE2 = '#7d8c94';
const GLOW = '#8fd4e8', PALE = '#b6d8e4', AMBER = '#e8d4a8', BAD = '#c4553f';

/* 一格。x/y/w/h 是整页坐标；inner 直接按格子的像素尺寸来画，
   viewBox 跟着格子走，所以不会有一处被悄悄裁掉。 */
function slot(x, y, w, h, inner) {
  return `
    <svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
      ${inner}
    </svg>
    <path d="M${x} ${y}H${x + w}V${y + h}H${x}Z" fill="none" stroke="${INK}" stroke-width="14"/>`;
}

/* 台词气泡。尾巴从底下伸出去，指向说话的那一格。 */
function bubble(x, y, w, lines, { h = 0, tail = 1 } = {}) {
  const hh = h || lines.length * 40 + 34;
  const tx = x + w / 2 + tail * w * 0.22;
  return `
    <path d="M${x} ${y}H${x + w}V${y + hh}H${tx + 26}L${tx + 6} ${y + hh + 46}L${tx - 22} ${y + hh}H${x}Z"
      fill="${PAPER}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    ${lines.map((s, i) =>
      `<text x="${x + w / 2}" y="${y + 46 + i * 40}" font-family="monospace" font-size="27"
        fill="${INK}" text-anchor="middle">${s}</text>`).join('')}`;
}

/* 网点。漫画的灰阶都靠它，别用第二层透明度去冒充。 */
function dots(x, y, w, h, color = MUTE2, gap = 16, r = 3.4, op = 0.5) {
  const out = [];
  for (let yy = y; yy < y + h; yy += gap) {
    for (let xx = x; xx < x + w; xx += gap) {
      out.push(`<circle cx="${xx}" cy="${yy}" r="${r}"/>`);
    }
  }
  return `<g fill="${color}" opacity="${op}">${out.join('')}</g>`;
}

/* 速度线：从 a 到 b 的一束，用来压住"事情正在发生"的那一下。 */
function speed(x1, y1, x2, y2, n = 7, color = GLOW, op = 0.5) {
  return `<g stroke="${color}" stroke-width="4" opacity="${op}">${Array.from({ length: n }, (_, i) => {
    const t = (i - (n - 1) / 2) * 18;
    return `<path d="M${x1} ${y1 + t}L${x2} ${y2 + t}"/>`;
  }).join('')}</g>`;
}

/* 那个小人。全篇只有这一个剪影，出现了就是"你"。 */
function you(x, y, s = 1, op = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"
       stroke="${INK}" stroke-width="6" stroke-linejoin="round">
      <path d="M0 0L24 5 26 38 -2 34Z" fill="${PAPER}"/>
      <circle cx="11" cy="-19" r="17" fill="${PAPER}"/>
    </g>`;
}

/* 一只手。腕在原点，指头朝上：腕、掌、四根手指、一根拇指都画出来 ——
   手一出现，就代表"这一步在外面"，所以它必须一眼认得出来。 */
function hand(x, y, s = 1, rot = 0, op = 1) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity="${op}"
       stroke="${INK}" stroke-width="8" stroke-linejoin="round">
      <path d="M-62 110L-74 -142L-74 -196A13 13 0 0 1 -48 -196L-48 -142L-40 -142
        L-40 -218A13 13 0 0 1 -14 -218L-14 -142L-6 -142L-6 -212A13 13 0 0 1 20 -212
        L20 -142L28 -142L28 -190A13 13 0 0 1 54 -190L54 -96L64 -136L112 -190
        A16 16 0 0 1 128 -168L104 -116L58 -50L56 110Z" fill="${MUTE}"/>
    </g>`;
}

/* 一条手臂：粗线一笔，圆头，从画面外面伸进来。 */
function arm(x1, y1, x2, y2, w = 104) {
  return `<g fill="none" stroke-linecap="round">
    <path d="M${x1} ${y1}L${x2} ${y2}" stroke="${INK}" stroke-width="${w + 18}"/>
    <path d="M${x1} ${y1}L${x2} ${y2}" stroke="${MUTE}" stroke-width="${w}"/>
  </g>`;
}

/* 先知：一块镜面多面体，没有手脚。 */
function seer(x, y, s = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="7" stroke-linejoin="round">
      <path d="M0-110L70 0 0 110-70 0Z" fill="${INK3}"/>
      <path d="M0-110L0 0-70 0Z" fill="${MUTE}"/>
      <path d="M0-110L70 0 0 0Z" fill="${MUTE2}"/>
      <path d="M-70 0L0 0 0 110Z" fill="#3d4d57"/>
      <path d="M70 0L0 0 0 110Z" fill="${INK2}"/>
      <path d="M-30-30L30 30M-30 30L30-30" stroke="${PALE}" stroke-width="5" opacity=".9"/>
    </g>`;
}

/* 一张卡片。上下文窗口里装的就是这种东西，项目箱子里装的也是。 */
function card(x, y, w, h, lines, color = PALE, { op = 1, tilt = 0, body = INK2 } = {}) {
  const t = tilt ? ` transform="rotate(${tilt} ${x + w / 2} ${y + h / 2})"` : '';
  return `
    <g${t} opacity="${op}" stroke="${INK}" stroke-width="7" stroke-linejoin="round">
      <path d="M${x} ${y}H${x + w}V${y + h}H${x}Z" fill="${body}"/>
      <path d="M${x} ${y}H${x + w}V${y + 40}H${x}Z" fill="${color}"/>
      ${lines.map((s, i) =>
        `<text x="${x + 22}" y="${y + 88 + i * 44}" font-family="monospace" font-size="${i ? 26 : 30}"
          font-weight="${i ? 400 : 700}" fill="${i ? PALE : PAPER}" stroke="none">${s}</text>`).join('')}
    </g>`;
}

const frame = inner => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${inner}
    <rect x="14" y="14" width="1572" height="872" fill="none" stroke="#0b0f12" stroke-width="28"/>
  </svg>`;

/* 一块漫画里的石头。hatch 决定它是不是真的 —— 和游戏里同一条线索。 */
function stoneSVG(x, y, w, h, { hatch = true, glow = 0 } = {}) {
  const lines = hatch
    ? Array.from({ length: Math.floor((w - 20) / 34) }, (_, i) =>
        `<path d="M${x + 22 + i * 34} ${y + 12}L${x + 54 + i * 34} ${y + h - 12}" stroke="#7d8c94" stroke-width="4"/>`).join('')
    : '';
  return `
    <g stroke="#0b0f12" stroke-width="7" stroke-linejoin="round">
      <path d="M${x} ${y}H${x + w}V${y + h}H${x}Z" fill="${hatch ? '#9fb0b8' : '#dfe7e9'}"/>
      <path d="M${x} ${y}H${x + w}L${x + w - 10} ${y + 14}H${x + 10}Z" fill="${hatch ? '#dfe7e9' : '#dfe7e9'}"/>
      <path d="M${x} ${y}H${x + 14}L${x + 14} ${y + h}H${x}Z" fill="#7d8c94"/>
    </g>
    ${lines}
    ${glow ? `<path d="M${x - 12} ${y - 12}H${x + w + 12}V${y + h + 12}H${x - 12}Z" fill="none"
        stroke="#8fd4e8" stroke-width="4" stroke-dasharray="16 12" opacity="${glow}"/>` : ''}`;
}

/* 01 · 它给的路，是从几个里采样出来的。
   序章那五格照旧 —— 你掉进来、看见门、看见它、看见它看不见你、
   镜片落在手边。第六格才说这一章的事：同一个问题，它答了三次。 */
const PANEL_AGAIN = {
  id: 'again',
  cap: { text: '同一个问题，它答了三次。<br>三次都一样确定。', cls: 'cap zh',
         style: 'left:6%;top:7%;max-width:34%' },
  art: frame(`
    <rect width="1600" height="900" fill="${INK2}"/>
    ${slot(0, 0, 1600, 430, `
      <rect width="1600" height="430" fill="${INK3}"/>
      ${dots(0, 0, 1600, 430, MUTE2, 26, 4, .16)}
      ${seer(340, 236, 1.2)}
      ${bubble(600, 118, 520, ['这里有三条路。', '三条都能走。'], { tail: -1 })}
      <g stroke="${GLOW}" stroke-width="4" opacity=".5">
        ${Array.from({ length: 14 }, (_, i) =>
          `<path d="M${160 - i * 9} ${400 - i * 22}L${-20} ${320 - i * 24}"/>`).join('')}
      </g>
    `)}
    ${slot(0, 470, 1600, 430, `
      <rect width="1600" height="430" fill="${INK}"/>
      <!-- 同一句话，落在三张卡上：字一样，底下的路不一样 -->
      ${[[180, '第一次', '低处的阶梯', GLOW, '88'], [620, '第二次', '浮空的石阶', AMBER, '81'],
         [1060, '第三次', '门后的直路', BAD, '84']].map(([x, n, road, c, conf]) => `
        <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
          <path d="M${x} 40H${x + 360}V${288}H${x}Z" fill="${INK3}" stroke="${c}" stroke-width="7"/>
        </g>
        <text x="${x + 180}" y="86" font-family="monospace" font-size="26"
          fill="${MUTE}" text-anchor="middle" letter-spacing="4">${n}</text>
        <text x="${x + 180}" y="164" font-family="monospace" font-size="34"
          fill="${c}" text-anchor="middle">${road}</text>
        <text x="${x + 180}" y="240" font-family="monospace" font-size="26"
          fill="${PALE}" text-anchor="middle">置信 ${conf}%</text>
        ${speed(x + 20, 262, x + 340, 262, 5, c, .35)}
      `).join('')}
      <text x="800" y="344" font-family="monospace" font-size="24" fill="${MUTE}"
        text-anchor="middle">语气一样，路只有一条是真的</text>
    `)}
  `)
};

const CHAPTER_PANELS = {
  /* 01 ── 采样的那一刻，就是它开口的那一刻 */
  model: () => [...PANELS_CH1.slice(0, 4), PANEL_AGAIN, PANELS_CH1[4]],

  /* 02 ── 它只有一张嘴，没有手 */
  chat: () => [
    {
      id: 'window',
      cap: { text: '它说得出位置、说得出顺序、说得出该怎么扳。', cls: 'cap zh',
             style: 'left:7%;top:9%;max-width:44%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        <!-- 一张脸的窗口，玻璃后面是它 -->
        ${slot(0, 0, 1600, 620, `
          <rect width="1600" height="620" fill="${INK}"/>
          ${seer(800, 300, 1.6)}
          <circle cx="800" cy="300" r="250" fill="${GLOW}" opacity=".1"/>
          <g stroke="${INK}" stroke-width="16" fill="none">
            <path d="M300 620V120H1300V620"/>
          </g>
          <g stroke="${PALE}" stroke-width="3" opacity=".18">
            <path d="M300 200L1300 420M300 420L1300 200"/>
          </g>
          ${bubble(360, 400, 880, ['门上有三个机关。', '从左到右，一个一个往下压。'], { tail: -1 })}
        `)}
        ${slot(0, 660, 1600, 240, `
          <rect width="1600" height="240" fill="${INK3}"/>
          <!-- 窗口外面的三个机关：看得见，一个也没动 -->
          ${[440, 800, 1160].map((x, i) => `
            <g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
              <path d="M${x - 46} 70H${x + 46}V200H${x - 46}Z" fill="${INK2}"/>
              <path d="M${x - 14} 70H${x + 14}V${100 + i * 26}H${x - 14}Z" fill="#3d4d57"/>
            </g>
            <text x="${x}" y="232" font-family="monospace" font-size="24" fill="${MUTE}"
              text-anchor="middle">机关 ${i + 1}</text>`).join('')}
        `)}
      `)
    },
    {
      id: 'nohand',
      cap: { text: '最后一寸，得由你的手来走。', cls: 'cap zh',
             style: 'right:7%;top:9%;max-width:38%;text-align:right' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK}"/>
        ${slot(0, 0, 1600, 900, `
          <rect width="1600" height="900" fill="${INK2}"/>
          ${dots(0, 0, 1600, 900, MUTE2, 30, 4, .13)}
          <!-- 从里侧贴在玻璃上的、没有指节的一团光 -->
          <circle cx="400" cy="420" r="230" fill="${GLOW}" opacity=".12"/>
          <path d="M240 660C240 470 310 386 400 386S560 470 560 660Z"
            fill="${GLOW}" opacity=".18" stroke="${GLOW}" stroke-width="4" stroke-dasharray="18 14"/>
          <text x="400" y="716" font-family="monospace" font-size="26" fill="${PALE}"
            text-anchor="middle" opacity=".8">说的是话，不是手</text>
          <!-- 玻璃：它那侧到此为止 -->
          <path d="M800 60V860" stroke="${INK}" stroke-width="20"/>
          <path d="M800 60V860" stroke="${PALE}" stroke-width="3" opacity=".28"/>
          <!-- 这一侧：你的手，正在把一个机关压下去 -->
          <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
            <path d="M900 600H1060V676H900Z" fill="${INK3}"/>
            <path d="M980 676V860" stroke="${PALE}" stroke-width="14"/>
            <path d="M940 640H1020" stroke="${INK}" stroke-width="9"/>
          </g>
          <circle cx="1000" cy="600" r="170" fill="${AMBER}" opacity=".1"/>
          ${hand(983, 851, 1.15, 0)}
          <text x="1210" y="560" font-family="monospace" font-size="26" fill="${AMBER}"
            text-anchor="middle" opacity=".9">手在这一侧</text>
        `)}
      `)
    },
  ],

  /* 03 ── 提示词不新增石头，只决定这一次用哪一块 */
  prompt: () => [
    {
      id: 'signs',
      cap: { text: '它面前立着三块牌子。<br>你转亮哪一块，它就走哪条路。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:42%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 600, MUTE2, 30, 4, .12)}
        ${slot(0, 600, 1600, 300, `
          <rect width="1600" height="300" fill="${INK}"/>
          ${stoneSVG(-20, 60, 1020, 130)}
          ${stoneSVG(1320, 60, 320, 130)}
          <!-- 缝：底下什么也没有 -->
          <path d="M1000 194H1320" stroke="${BAD}" stroke-width="6"/>
          <text x="1160" y="132" font-family="monospace" font-size="46" fill="${BAD}"
            text-anchor="middle">?</text>
        `)}
        <!-- 三块牌子，三根柱子，字都认得 -->
        ${[['?!', 300, MUTE2, 'over'], ['◈', 620, AMBER, 'mid'], ['→', 940, GLOW, 'down']]
          .map(([glyph, x, c]) => `
          <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
            <path d="M${x} 452V706" stroke="${c}" stroke-width="16"/>
            <path d="M${x - 140} 300H${x + 140}V452H${x - 140}Z" fill="${INK3}" stroke="${c}" stroke-width="7"/>
          </g>
          <text x="${x}" y="416" font-family="monospace" font-size="80" fill="${c}"
            text-anchor="middle">${glyph}</text>`).join('')}
      `)
    },
    {
      id: 'under',
      cap: { text: '石头一直在。<br>它只是一直没往那儿看。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:40%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 600, MUTE2, 30, 4, .12)}
        ${slot(0, 600, 1600, 300, `
          <rect width="1600" height="300" fill="${INK}"/>
          <!-- 缝里的那块，本来就在 -->
          ${stoneSVG(1004, 100, 312, 160, { glow: .95 })}
          ${stoneSVG(-20, 100, 1020, 160)}
          ${stoneSVG(1320, 100, 320, 160)}
          <circle cx="1160" cy="180" r="104" fill="${GLOW}" opacity=".14"/>
          <text x="1160" y="66" font-family="monospace" font-size="30" fill="${GLOW}"
            text-anchor="middle">一直在这</text>
        `)}
        <!-- 只有中间那块亮着，一束光正好落在缝上 -->
        ${[['?!', 300, MUTE2], ['◈', 620, AMBER], ['→', 940, GLOW]]
          .map(([glyph, x, c], i) => `
          <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
            <path d="M${x} 452V706" stroke="${c}" stroke-width="16" opacity="${i === 1 ? 1 : .28}"/>
            <path d="M${x - 140} 300H${x + 140}V452H${x - 140}Z" fill="${INK3}"
              stroke="${c}" stroke-width="7" opacity="${i === 1 ? 1 : .35}"/>
          </g>
          <text x="${x}" y="416" font-family="monospace" font-size="80" fill="${c}"
            text-anchor="middle" opacity="${i === 1 ? 1 : .3}">${glyph}</text>`).join('')}
        <path d="M620 452L1150 690L1250 690L760 452Z" fill="${GLOW}" opacity=".16"/>
        ${speed(700, 484, 920, 484, 6, AMBER, .35)}
      `)
    },
  ],

  /* 04 ── 窗口只有三个位置，第四个进来，最早的就得走 */
  forget: () => [
    {
      id: 'window3',
      cap: { text: '它的记性是一张只有三格的桌子。<br>第四样放上来，最早那样就得走。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:44%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 30, 4, .1)}
        <!-- 三格的窗口，边框画粗一点，它是有容量的 -->
        ${slot(150, 300, 1000, 420, `
          <rect width="1000" height="420" fill="${INK}"/>
          <g stroke="${MUTE2}" stroke-width="6" opacity=".45">
            <path d="M333 40V380M667 40V380"/>
          </g>
          ${card(22, 56, 288, 270, ['钥匙', '在门框上面'], GLOW)}
          ${card(356, 56, 288, 270, ['阿岩', '在塔下等着'], AMBER)}
          ${card(690, 56, 288, 270, ['门', '在东边'], PALE)}
        `)}
        <!-- 第四张正从窗口外面塞进来 -->
        ${card(1190, 396, 280, 252, ['下雨', '要带伞'], BAD, { tilt: 8 })}
        ${speed(1480, 322, 1400, 360, 8, BAD, .45)}
        <text x="1330" y="306" font-family="monospace" font-size="26" fill="${BAD}"
          text-anchor="middle">第四样</text>
        <path d="M1330 320V356" stroke="${BAD}" stroke-width="5" stroke-linecap="round"/>
        <text x="560" y="800" font-family="monospace" font-size="26" fill="${MUTE}"
          text-anchor="middle">桌上只有三格</text>
      `)
    },
    {
      id: 'pushed',
      cap: { text: '被挤出去的那一张，不会有人提醒你。', cls: 'cap zh',
             style: 'right:7%;top:8%;max-width:40%;text-align:right' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 30, 4, .1)}
        ${slot(150, 210, 1000, 380, `
          <rect width="1000" height="380" fill="${INK}"/>
          <g stroke="${MUTE2}" stroke-width="6" opacity=".4">
            <path d="M333 30V360M667 30V360"/>
          </g>
          <!-- 三格都满着。少了些什么，画面上没有任何标记 -->
          ${card(22, 46, 288, 260, ['阿岩', '在塔下等着'], AMBER)}
          ${card(356, 46, 288, 260, ['门', '在东边'], PALE)}
          ${card(690, 46, 288, 260, ['下雨', '要带伞'], BAD)}
        `)}
        <!-- 掉出去的那张躺在地上，还带着余温 -->
        ${card(180, 645, 300, 190, ['钥匙', '在门框上面'], GLOW, { op: .7, tilt: -6, body: INK3 })}
        ${dots(170, 620, 420, 230, GLOW, 22, 3, .12)}
        <text x="800" y="790" font-family="monospace" font-size="28" fill="${MUTE2}"
          text-anchor="middle">它不会告诉你，它忘了什么</text>
      `)
    },
  ],

  /* 05 ── 记下来的东西在窗外，你能改它 */
  memory: () => [
    {
      id: 'wall',
      cap: { text: '它记下的东西，刻在墙上。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:40%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        <!-- 一整面墙，砖缝 -->
        <rect x="0" y="0" width="1600" height="900" fill="${INK3}"/>
        <g stroke="${INK}" stroke-width="5" opacity=".7">
          ${Array.from({ length: 12 }, (_, i) => {
            const y = i * 76;
            const off = i % 2 ? 0 : 92;
            return `<path d="M0 ${y}H1600"/>` +
              Array.from({ length: 9 }, (_, k) => `<path d="M${off + k * 184} ${y}V${y + 76}"/>`).join('');
          }).join('')}
        </g>
        ${dots(0, 0, 1600, 900, MUTE2, 34, 4, .08)}
        <!-- 刻痕：它自己以为的规矩。每一行都是它真的会答的一句话 -->
        <g font-family="monospace" font-size="42" fill="${AMBER}" letter-spacing="2">
          <text x="380" y="322">墙是封死的</text>
          <text x="380" y="398">他叫阿岩</text>
          <text x="380" y="474">门在东边</text>
          <text x="380" y="550" fill="${MUTE2}">记得带伞</text>
        </g>
        <g stroke="${AMBER}" stroke-width="5" opacity=".5" stroke-linecap="round">
          <path d="M380 334H592M380 410H500M380 486H510M380 562H514"/>
        </g>
        <text x="690" y="250" font-family="monospace" font-size="30" fill="${MUTE}"
          text-anchor="middle" letter-spacing="3">刻在这里的第 1 条</text>
        <text x="690" y="700" font-family="monospace" font-size="46" fill="${AMBER}"
          text-anchor="middle">墙是封死的</text>
        <circle cx="690" cy="690" r="240" fill="${AMBER}" opacity=".07"/>
        <!-- 你站在镜子前，看着这行字 -->
        ${you(1330, 786, 2.4)}
      `)
    },
    {
      id: 'chisel',
      cap: { text: '它记错了。<br>你可以凿开那行字，重刻一遍。', cls: 'cap zh',
             style: 'left:5%;top:6%;max-width:32%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        <rect x="0" y="0" width="1600" height="900" fill="${INK3}"/>
        <g stroke="${INK}" stroke-width="5" opacity=".7">
          ${Array.from({ length: 12 }, (_, i) => {
            const y = i * 76;
            const off = i % 2 ? 0 : 92;
            return `<path d="M0 ${y}H1600"/>` +
              Array.from({ length: 9 }, (_, k) => `<path d="M${off + k * 184} ${y}V${y + 76}"/>`).join('');
          }).join('')}
        </g>
        <!-- 被凿开的那一行：墙真的让开了一道口，光从里面出来 -->
        <path d="M300 360H1300V470H1240L1180 520 1120 470H300Z" fill="${INK}"/>
        <path d="M300 470H1120L1180 520 1240 470H1300V620H300Z" fill="${GLOW}" opacity=".22"/>
        <g stroke="${GLOW}" stroke-width="4" opacity=".45">
          ${Array.from({ length: 16 }, (_, i) => `<path d="M${320 + i * 62} 470V620"/>`).join('')}
        </g>
        <!-- 凿掉的字，碎在地上 -->
        <g stroke="${MUTE2}" stroke-width="7" stroke-linejoin="round" opacity=".7">
          <path d="M480 800L520 790 528 822 488 830Z" fill="${INK2}"/>
          <path d="M620 826L664 818 670 846 626 852Z" fill="${INK2}"/>
          <path d="M760 800L796 794 802 820 766 826Z" fill="${INK2}"/>
        </g>
        <!-- 新刻上去的那行 -->
        <text x="800" y="250" font-family="monospace" font-size="30" fill="${MUTE}"
          text-anchor="middle" letter-spacing="3">现在它是这样</text>
        <text x="800" y="330" font-family="monospace" font-size="62" fill="${AMBER}"
          text-anchor="middle">墙可以让开</text>
        <!-- 手里握着錾子 -->
        <circle cx="1170" cy="620" r="200" fill="${PALE}" opacity=".1"/>
        <g transform="translate(1170 742) rotate(-12)">
          <path d="M-9 -268H9V-118H-9Z" fill="${PALE}" stroke="${INK}" stroke-width="7"/>
          <path d="M-14 -268H14V-296H-14Z" fill="${AMBER}" stroke="${INK}" stroke-width="7"/>
        </g>
        ${hand(1150, 900, 1.5, -8)}
      `)
    },
  ],

  /* 06 ── 它只写单子，外面的手才碰得到世界 */
  tools: () => [
    {
      id: 'order',
      cap: { text: '它只写单子。<br>单子飞到窗口边上就停下了。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:40%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        <!-- 左半：窗口里面 -->
        ${slot(0, 0, 780, 900, `
          <rect width="780" height="900" fill="${INK}"/>
          ${dots(0, 0, 780, 900, MUTE2, 30, 4, .12)}
          ${seer(390, 320, 1.15)}
          ${bubble(120, 500, 540, ['把门左边那个', '东西按下去。'], { tail: -1 })}
          <!-- 单子从它这里写出来 -->
          <g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
            <path d="M300 676H560V812H300Z" fill="${PAPER}"/>
            <g stroke="${MUTE2}" stroke-width="6" stroke-linecap="round">
              <path d="M336 716H520M336 752H480M336 788H512"/>
            </g>
          </g>
          <text x="430" y="860" font-family="monospace" font-size="24" fill="${MUTE}"
            text-anchor="middle">单子</text>
        `)}
        <!-- 分界：玻璃 -->
        <path d="M780 0V900" stroke="${INK}" stroke-width="20"/>
        <path d="M780 0V900" stroke="${PALE}" stroke-width="3" opacity=".25"/>
        <!-- 右半：外面，手和柄 -->
        ${slot(820, 0, 780, 900, `
          <rect width="780" height="900" fill="${INK3}"/>
          ${dots(0, 0, 780, 900, MUTE2, 30, 4, .1)}
          <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
            <!-- 一块牌子：读 ◐ -->
            <path d="M110 528H290V700H110Z" fill="${INK2}"/>
            <path d="M200 700V878" stroke="${PALE}" stroke-width="14"/>
            <text x="200" y="650" font-family="monospace" font-size="72" fill="${GLOW}"
              text-anchor="middle">◐</text>
            <!-- 一个柄：压下去 -->
            <path d="M500 620H700V700H500Z" fill="${INK2}"/>
            <path d="M600 620V520" stroke="${AMBER}" stroke-width="20"/>
          </g>
          <circle cx="600" cy="484" r="46" fill="${AMBER}" stroke="${INK}" stroke-width="8"/>
          <!-- 一只手扣在柄上，指头正压在球上 -->
          <circle cx="600" cy="620" r="150" fill="${AMBER}" opacity=".1"/>
          ${hand(600, 760, 1.2, 6)}
          <text x="400" y="852" font-family="monospace" font-size="24" fill="${MUTE}"
            text-anchor="middle">手在这一侧</text>
        `)}
      `)
    },
    {
      id: 'blurry',
      cap: { text: '单子写得含糊，外面的手就会做错。', cls: 'cap zh',
             style: 'left:5%;top:6%;max-width:30%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .1)}
        ${slot(0, 0, 1600, 430, `
          <rect width="1600" height="430" fill="${INK}"/>
          <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
            <path d="M630 96H1400V344H630Z" fill="${PAPER}"/>
          </g>
          <text x="1015" y="206" font-family="monospace" font-size="52" fill="${INK}"
            text-anchor="middle">把那个东西弄一下</text>
          <text x="1015" y="292" font-family="monospace" font-size="26" fill="${BAD}"
            text-anchor="middle">↑ 单子上只有这一句</text>
        `)}
        ${slot(0, 470, 1600, 430, `
          <rect width="1600" height="430" fill="${INK3}"/>
          <!-- 外面有三样东西，谁也不知道是哪一样 -->
          ${[340, 800, 1260].map((x, i) => `
            <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
              <path d="M${x - 70} 140H${x + 70}V270H${x - 70}Z" fill="${INK2}"/>
              <path d="M${x} 140V${60 - i * 10}" stroke="${AMBER}" stroke-width="16"/>
            </g>
            <text x="${x}" y="318" font-family="monospace" font-size="26"
              fill="${i === 1 ? BAD : MUTE}" text-anchor="middle">${i === 1 ? '✕ 压错了' : '柄 ' + (i + 1)}</text>`).join('')}
        `)}
      `)
    },
  ],

  /* 07 ── 每根线插到中间，不是两两相接 */
  mcp: () => [
    {
      id: 'nine',
      cap: { text: '三个工具、三种用法。<br>不接转接，就得连九根。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:40%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .1)}
        ${slot(0, 0, 1600, 900, `
          <rect width="1600" height="900" fill="${INK}"/>
          ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .08)}
          <!-- 九根，横穿整张图 -->
          <g stroke="${MUTE2}" stroke-width="5" opacity=".55" fill="none">
            ${[0, 1, 2].map(i => [0, 1, 2].map(j =>
              `<path d="M300 ${300 + i * 190}C720 ${300 + i * 190 + (j - 1) * 150} 900 ${300 + j * 190 - (i - 1) * 150} 1300 ${300 + j * 190}"/>`
            ).join('')).join('')}
          </g>
          <!-- 左：三个工具 -->
          ${[0, 1, 2].map(i => `
            <g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
              <path d="M150 ${254 + i * 190}H300V${346 + i * 190}H150Z" fill="${INK3}" stroke="${PALE}" stroke-width="5"/>
            </g>
            <text x="225" y="${312 + i * 190}" font-family="monospace" font-size="30"
              fill="${PALE}" text-anchor="middle">工具 ${i + 1}</text>`).join('')}
          <!-- 右：三种用法 -->
          ${[0, 1, 2].map(j => `
            <g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
              <path d="M1300 ${254 + j * 190}H1450V${346 + j * 190}H1300Z" fill="${INK3}" stroke="${AMBER}" stroke-width="5"/>
            </g>
            <text x="1375" y="${312 + j * 190}" font-family="monospace" font-size="30"
              fill="${AMBER}" text-anchor="middle">用法 ${j + 1}</text>`).join('')}
        `)}
        <text x="800" y="800" font-family="monospace" font-size="34" fill="${BAD}"
          text-anchor="middle" letter-spacing="6">3 × 3 = 9 根线</text>
      `)
    },
    {
      id: 'hub',
      cap: { text: '中间多一个转接的。<br>九根变成六根，乱也散了。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:40%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .1)}
        ${slot(0, 0, 1600, 900, `
          <rect width="1600" height="900" fill="${INK}"/>
          ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .08)}
          <!-- 三根进，三根出，齐整 -->
          <g stroke="${GLOW}" stroke-width="6" opacity=".85" fill="none">
            ${[0, 1, 2].map(i =>
              `<path d="M300 ${300 + i * 190}C520 ${300 + i * 190} 620 490 700 490"/>`).join('')}
            ${[0, 1, 2].map(j =>
              `<path d="M900 490C1000 490 1120 ${300 + j * 190} 1300 ${300 + j * 190}"/>`).join('')}
          </g>
          <!-- 中间的转接块 -->
          <g stroke="${INK}" stroke-width="9" stroke-linejoin="round">
            <path d="M700 380H900V600H700Z" fill="${INK3}" stroke="${GLOW}" stroke-width="7"/>
            <path d="M700 470H900M700 510H900" stroke="${PALE}" stroke-width="5" opacity=".5"/>
          </g>
          <circle cx="800" cy="490" r="180" fill="${GLOW}" opacity=".12"/>
          <text x="800" y="446" font-family="monospace" font-size="30" fill="${PALE}"
            text-anchor="middle">转接</text>
          ${[0, 1, 2].map(i => `
            <g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
              <path d="M150 ${254 + i * 190}H300V${346 + i * 190}H150Z" fill="${INK3}" stroke="${PALE}" stroke-width="5"/>
            </g>
            <text x="225" y="${312 + i * 190}" font-family="monospace" font-size="30"
              fill="${PALE}" text-anchor="middle">工具 ${i + 1}</text>`).join('')}
          ${[0, 1, 2].map(j => `
            <g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
              <path d="M1300 ${254 + j * 190}H1450V${346 + j * 190}H1300Z" fill="${INK3}" stroke="${AMBER}" stroke-width="5"/>
            </g>
            <text x="1375" y="${312 + j * 190}" font-family="monospace" font-size="30"
              fill="${AMBER}" text-anchor="middle">用法 ${j + 1}</text>`).join('')}
        `)}
        <!-- 一对一地插线是 3×3，中间过一个转接就只剩 3+3。
            两行拉开：旧的划掉、新的发亮，离底边的提示还有一段。 -->
        <g stroke="${BAD}" stroke-width="5" opacity=".7">
          <path d="M672 706H928"/>
        </g>
        <text x="800" y="700" font-family="monospace" font-size="28" fill="${MUTE2}"
          text-anchor="middle">3 × 3 = 9 根线</text>
        <text x="800" y="772" font-family="monospace" font-size="34" fill="${GLOW}"
          text-anchor="middle" letter-spacing="6">现在 3 + 3 = 6 根线</text>
      `)
    },
  ],

  /* 08 ── 到那一步，它自己来 */
  hook: () => [
    {
      id: 'bolted',
      cap: { text: '有一条规矩可以提前钉在墙上。<br>钉一次就够。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:42%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .1)}
        <!-- 门框 -->
        <g stroke="${INK}" stroke-width="16" fill="none">
          <path d="M480 900V120H1220V900"/>
        </g>
        ${slot(0, 0, 1600, 900, `
          <rect width="1600" height="900" fill="${INK}"/>
          ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .08)}
          <g stroke="${INK}" stroke-width="16" fill="none">
            <path d="M480 900V120H1220V900"/>
          </g>
          <!-- 钉在门框上的那块规矩牌 -->
          <g stroke="${INK}" stroke-width="9" stroke-linejoin="round">
            <path d="M560 300H1140V470H560Z" fill="${INK3}" stroke="${AMBER}" stroke-width="8"/>
            <path d="M600 330V420M1100 330V420" stroke="${AMBER}" stroke-width="6" opacity=".5"/>
          </g>
          <text x="850" y="378" font-family="monospace" font-size="40" fill="${AMBER}"
            text-anchor="middle">落地的那一刻</text>
          <text x="850" y="440" font-family="monospace" font-size="40" fill="${AMBER}"
            text-anchor="middle">→ 把歪的扶正</text>
          <!-- 规矩从牌子上垂下来，一直落到地面 -->
          <path d="M850 470C850 600 920 680 920 740" stroke="${AMBER}" stroke-width="6"
            fill="none" stroke-dasharray="16 12" opacity=".8"/>
          <!-- 地面上那件会歪的东西 -->
          ${stoneSVG(916, 660, 130, 76, { glow: .5 })}
          <!-- 手正在推它一下，就这一次 -->
          <circle cx="956" cy="700" r="120" fill="${AMBER}" opacity=".12"/>
          ${hand(962, 930, 1.05, -10)}
        `)}
        <text x="1150" y="760" font-family="monospace" font-size="28" fill="${AMBER}"
          text-anchor="middle" opacity=".85">只钉一次</text>
      `)
    },
    {
      id: 'fires',
      cap: { text: '之后每一次落地，它自己就做了。<br>你的手可以揣回去。', cls: 'cap zh',
             style: 'right:7%;top:8%;max-width:40%;text-align:right' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .1)}
        <!-- 一条地面，四次落地，四次扶正 -->
        ${stoneSVG(-20, 780, 1640, 130)}
        ${[0, 1, 2, 3].map(i => {
          const x = 250 + i * 340;
          return `
            <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
              <path d="M${x - 70} 700H${x + 70}V780H${x - 70}Z" fill="${INK3}" stroke="${AMBER}" stroke-width="5"/>
            </g>
            <path d="M${x - 60} 700L${x + 54} 640" stroke="${AMBER}" stroke-width="8"
              stroke-linecap="round" opacity="${.55 + i * .1}"/>
            <text x="${x}" y="664" font-family="monospace" font-size="34" fill="${GLOW}"
              text-anchor="middle">✓</text>
            <!-- 四个"落地"排在上面：下面那一条正被"点击继续"压着 -->
            <text x="${x}" y="606" font-family="monospace" font-size="24" fill="${MUTE}"
              text-anchor="middle">落地 ${i + 1}</text>`;
        }).join('')}
        <!-- 手已经揣回去了，离得很远：右下角只剩一处，还是空的 -->
        <circle cx="1470" cy="590" r="110" fill="${MUTE2}" opacity=".05"/>
        <g stroke="${MUTE2}" stroke-width="5" fill="none" opacity=".35" stroke-dasharray="12 10">
          <ellipse cx="1470" cy="590" rx="58" ry="72"/>
        </g>
        <path d="M1400 640H1290" stroke="${MUTE2}" stroke-width="4" stroke-dasharray="14 12"
          opacity=".45" fill="none"/>
        <text x="1436" y="730" font-family="monospace" font-size="26" fill="${MUTE2}"
          text-anchor="middle" opacity=".8">不在这儿</text>
      `)
    },
  ],

  /* 09 ── 先看目录，站在缺口边上才读正文 */
  skills: () => [
    {
      id: 'catalogue',
      cap: { text: '架子上排着一整套写好的动作。<br>名字看得见，正文还合着。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:42%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .08)}
        ${slot(0, 0, 1600, 900, `
          <rect width="1600" height="900" fill="${INK}"/>
          ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .06)}
          <!-- 架子 -->
          <path d="M70 760H1530" stroke="${INK}" stroke-width="26"/>
          <path d="M70 760H1530" stroke="${MUTE2}" stroke-width="4" opacity=".45"/>
          <!-- 一排书脊。名字是亮的，别的都在暗处 -->
          ${[['起跳', 190, GLOW], ['攀爬', 390, PALE], ['推门', 590, AMBER], ['听见', 790, MUTE2]]
            .map(([t, x, c]) => `
              <g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
                <path d="M${x} 340H${x + 150}V760H${x}Z" fill="${INK3}"/>
                <path d="M${x + 18} 340V760" stroke="${c}" stroke-width="5" opacity=".5"/>
              </g>
              ${[...t].map((g, i) => `
                <text x="${x + 92}" y="${552 + i * 54}" font-family="PingFang SC,Hiragino Sans GB,Noto Sans SC,sans-serif"
                  font-size="40" fill="${c}" text-anchor="middle">${g}</text>`).join('')}`).join('')}
          <!-- 抽出来的那一本，还合着：没有缝，也没有字 -->
          <circle cx="1250" cy="596" r="240" fill="${AMBER}" opacity=".1"/>
          <g stroke="${INK}" stroke-width="8" stroke-linejoin="round">
            <path d="M1080 430H1420V760H1080Z" fill="${AMBER}" opacity=".92"/>
            <path d="M1080 430H1420V520H1080Z" fill="${INK3}" opacity=".28"/>
            <path d="M1108 476H1392" stroke="${INK}" stroke-width="5" opacity=".35"/>
          </g>
          <text x="1250" y="600" font-family="monospace" font-size="26" fill="${INK}"
            text-anchor="middle" opacity=".4">合着</text>
          <text x="1250" y="398" font-family="monospace" font-size="34" fill="${AMBER}"
            text-anchor="middle">起跳 · 三步</text>
        `)}
      `)
    },
    {
      id: 'open',
      cap: { text: '站在缝边上，那一页才翻开。<br>它写的是这一步该怎么走。', cls: 'cap zh',
             style: 'left:5%;top:5%;max-width:31%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        <!-- 摊开的那一页 -->
        ${slot(480, 200, 1000, 340, `
          <rect width="1000" height="340" fill="${PAPER}"/>
          <path d="M500 0V340" stroke="${INK}" stroke-width="8"/>
          <text x="250" y="56" font-family="monospace" font-size="28" fill="${INK}"
            text-anchor="middle" letter-spacing="3">起跳 · 三步</text>
          <g font-family="monospace" font-size="24" fill="${INK}">
            <text x="48" y="126">1 退两步，够了就停</text>
            <text x="48" y="176">2 助跑，中途不松</text>
            <text x="48" y="226">3 到最后半格再起</text>
          </g>
          <!-- 右页：一条算好的弧 -->
          <path d="M540 280C670 100 830 100 940 250" stroke="${AMBER}" stroke-width="8"
            fill="none" stroke-dasharray="18 14"/>
          <text x="740" y="76" font-family="monospace" font-size="24" fill="${INK}"
            text-anchor="middle" opacity=".65">落点对得上</text>
        `)}
        <!-- 底下真的那道缝 -->
        ${slot(0, 560, 1600, 340, `
          <rect width="1600" height="340" fill="${INK}"/>
          ${stoneSVG(-20, 60, 640, 280)}
          ${stoneSVG(810, 60, 810, 280)}
          <path d="M620 292H810" stroke="${BAD}" stroke-width="5"/>
          <!-- 三道量尺压在缝上。数字拉一根引线搁到右边石板上 ——
              正中间和右肩都是"点击继续"的地盘。 -->
          <g stroke="${BAD}" stroke-width="4" opacity=".75">
            <path d="M622 274V292M808 274V292"/>
          </g>
          <path d="M816 204H884" stroke="${BAD}" stroke-width="4" fill="none" opacity=".6"/>
          <text x="896" y="216" font-family="monospace" font-size="34" fill="${BAD}">190</text>
          <path d="M600 250C660 30 780 30 840 250" stroke="${GLOW}" stroke-width="7"
            fill="none" opacity=".85"/>
          ${you(548, 240, 1.4)}
          ${speed(660, 200, 800, 200, 5, GLOW, .32)}
        `)}
      `)
    },
  ],

  /* 10 ── 一次装好，之后每次开口都带上 */
  project: () => [
    {
      id: 'scatter',
      cap: { text: '提示词、知识、工具、权限。<br>每开一次口，都得重新捡一遍。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:44%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .08)}
        ${stoneSVG(-20, 760, 1640, 160)}
        ${card(150, 400, 280, 210, ['提示词', '这一次要它做什么'], GLOW, { tilt: -9 })}
        ${card(496, 470, 280, 210, ['知识', '那份手册'], PALE, { tilt: 6 })}
        ${card(842, 400, 280, 210, ['工具', '读、写、跑'], AMBER, { tilt: -6 })}
        ${card(1188, 480, 280, 210, ['权限', '只准看这一个'], BAD, { tilt: 9 })}
        <text x="800" y="330" font-family="monospace" font-size="30" fill="${MUTE2}"
          text-anchor="middle">下一次开口，还得再捡一遍</text>
      `)
    },
    {
      id: 'crate',
      cap: { text: '装进一个箱子，扣上。<br>之后每次开口，它自己带上。', cls: 'cap zh',
             style: 'right:7%;top:8%;max-width:40%;text-align:right' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 32, 4, .08)}
        ${stoneSVG(-20, 760, 1640, 160)}
        <!-- 箱子 -->
        <g stroke="${INK}" stroke-width="9" stroke-linejoin="round">
          <path d="M460 400H1140V470H460Z" fill="${INK2}" stroke="${AMBER}" stroke-width="7"/>
          <path d="M480 470H1120V780H480Z" fill="${INK3}" stroke="${AMBER}" stroke-width="7"/>
          <path d="M700 470V780M900 470V780" stroke="${INK}" stroke-width="7" opacity=".7"/>
          <path d="M500 560H1100" stroke="${AMBER}" stroke-width="5" opacity=".5"/>
        </g>
        <!-- 四面印子：都在里面 -->
        ${[['提示词', 570, GLOW], ['知识', 740, PALE], ['工具', 910, AMBER], ['权限', 1040, BAD]]
          .map(([t, x, c]) => `
            <g stroke="${INK}" stroke-width="6" stroke-linejoin="round">
              <path d="M${x - 56} 620H${x + 56}V680H${x - 56}Z" fill="${INK}" stroke="${c}" stroke-width="5"/>
            </g>
            <text x="${x}" y="660" font-family="monospace" font-size="24" fill="${c}"
              text-anchor="middle">${t}</text>`).join('')}
        <!-- 一只手把盖子按下去 -->
        <circle cx="1210" cy="620" r="150" fill="${AMBER}" opacity=".1"/>
        ${speed(1180, 470, 1180, 372, 5, AMBER, .35)}
        ${arm(965, 0, 965, 200, 92)}
        ${hand(962, 240, 0.9, 180)}
      `)
    },
  ],

  /* 11 ── 它自己转，你握刹车 */
  agent: () => [
    {
      id: 'ring',
      cap: { text: '模型在里面答话。<br>外面再套一圈循环，它就开始自己走了。', cls: 'cap zh',
             style: 'left:7%;top:8%;max-width:42%' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 30, 4, .1)}
        <!-- 那一圈。合不上，右边留着一道缝 -->
        <path d="M1051 543A300 300 0 1 1 1051 397" fill="none" stroke="${GLOW}"
          stroke-width="11" opacity=".85"/>
        <g stroke="${BAD}" stroke-width="7" stroke-linecap="round">
          <path d="M1058 556L1094 590M1058 384L1094 350"/>
        </g>
        <text x="1114" y="464" font-family="monospace" font-size="30" fill="${BAD}">缝</text>
        <!-- 它一直在这一圈上跑，跑了很多趟 -->
        ${[[976, 678, .16], [1006, 644, .3], [1032, 594, .5], [1051, 543, 1]]
          .map(([x, y, o]) => you(x, y, 1.6, o)).join('')}
        ${speed(880, 736, 980, 704, 6, GLOW, .2)}
        <!-- 到了缝边就折回去 -->
        <g stroke="${GLOW}" stroke-width="6" fill="none" stroke-dasharray="16 12" opacity=".8">
          <path d="M1044 496C1000 442 936 452 910 492"/>
          <path d="M894 472L910 494 930 474"/>
        </g>
        <text x="880" y="424" font-family="monospace" font-size="26" fill="${MUTE}"
          text-anchor="middle">到这儿就折回去</text>
        <text x="1120" y="762" font-family="monospace" font-size="30" fill="${MUTE2}">第 12 趟</text>
        <text x="1120" y="808" font-family="monospace" font-size="24" fill="${MUTE2}"
          opacity=".65">一次也没跨过那道缝</text>
      `)
    },
    {
      id: 'brake',
      cap: { text: '它不会自己停。<br>手刹一直在你这一边。', cls: 'cap zh',
             style: 'right:7%;top:8%;max-width:38%;text-align:right' },
      art: frame(`
        <rect width="1600" height="900" fill="${INK2}"/>
        ${dots(0, 0, 1600, 900, MUTE2, 30, 4, .1)}
        <!-- 那一圈还在转，只是退到后面去了 -->
        <path d="M854 424A190 190 0 1 1 854 336" fill="none" stroke="${GLOW}"
          stroke-width="8" opacity=".5"/>
        <g stroke="${BAD}" stroke-width="5" opacity=".7">
          <path d="M860 434L886 452M860 326L886 308"/>
        </g>
        <path d="M702 190L676 176 676 204Z" fill="${GLOW}" opacity=".6"/>
        <text x="560" y="690" font-family="monospace" font-size="28" fill="${MUTE2}"
          text-anchor="middle">还在转</text>
        <!-- 底盘、杆、握球。杆已经被拉到这边了，人是在"还握着"的那一刻。
             底盘压在画面下缘当地面；手和别处一样从边上长上来，不再另接一段胳膊。 -->
        <g stroke="${INK}" stroke-width="9" stroke-linejoin="round">
          <path d="M1040 836H1240V900H1040Z" fill="${INK3}" stroke="${AMBER}" stroke-width="6"/>
          <path d="M1160 836L1322 786" stroke="${AMBER}" stroke-width="26"/>
        </g>
        <!-- 底盘和杆先在：杆头插进球里，不伸到手的这边来 -->
        <g stroke="${INK}" stroke-width="9" stroke-linejoin="round">
          <path d="M1040 836H1240V900H1040Z" fill="${INK3}" stroke="${AMBER}" stroke-width="6"/>
          <path d="M1160 836L1334 762" stroke="${AMBER}" stroke-width="26"/>
        </g>
        <circle cx="1352" cy="762" r="120" fill="${AMBER}" opacity=".12"/>
        <!-- 球先在，手压在上面：指头盖住球的前面，球从指缝两边露出来 ——
             这个先后顺序才是"握住"。反过来就是端着。 -->
        <circle cx="1352" cy="762" r="62" fill="${AMBER}" stroke="${INK}" stroke-width="9"/>
        ${hand(1352, 900, .74, 4)}
        <text x="1000" y="826" font-family="monospace" font-size="26" fill="${AMBER}"
          text-anchor="end" opacity=".85">手刹</text>
      `)
    },
  ],
};

export function buildComic(root, rail, counter, onDone) {
  let index = 0;
  let finished = false;

  rail.innerHTML = '';
  let PANELS = PANELS_CH1;
  let panels = [];
  let show = () => {};
  let advance = () => {};

  function mount(list) {
    PANELS = list;
    rail.innerHTML = '';
    list.forEach(p => {
      const el = document.createElement('div');
      el.className = 'comic-panel';
      el.innerHTML = p.art;
      if (p.cap) {
        const c = document.createElement('div');
        c.className = p.cap.cls;
        c.style.cssText = p.cap.style;
        c.innerHTML = p.cap.text;
        el.append(c);
      }
      rail.append(el);
    });
    panels = [...rail.querySelectorAll('.comic-panel')];
  }

  show = i => {
    panels.forEach((p, n) => p.classList.toggle('active', n === i));
    counter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(PANELS.length).padStart(2, '0');
  };

  advance = () => {
    if (finished) return;
    index++;
    if (index >= PANELS.length) {
      finished = true;
      root.classList.remove('on');
      setTimeout(() => onDone(), 420);
      return;
    }
    show(index);
  };

  root.addEventListener('click', advance);
  const onKey = e => {
    if (!root.classList.contains('on')) return;
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
  };
  document.addEventListener('keydown', onKey);

  mount(PANELS_CH1);

  return {
    /** 载入某一章的过场。chapterId 省略或没写就退回序章那五格。 */
    set(chapterId) {
      mount(CHAPTER_PANELS[chapterId]?.() || PANELS_CH1);
    },
    start() {
      index = 0; finished = false;
      root.classList.add('on');
      show(0);
    },
    skip() {
      if (finished) return;
      finished = true;
      root.classList.remove('on');
      setTimeout(() => onDone(), 420);
    },
    /** 只有第一格才显示"跳过过场"—— 后面几章只有两三格，跳什么 */
    get count() { return PANELS.length; }
  };
}
