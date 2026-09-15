// Original vector artwork for the Play & Earn tiles — one scene per game, all
// drawn on a 100x100 viewBox. No third-party logos or key art: every tile is
// built from primitives here, so the grid can be styled like a real game
// launcher without borrowing anyone else's branding.
import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

const WHITE = 'rgba(255,255,255,0.96)';
const GLASS = 'rgba(255,255,255,0.22)';
const GLASS_SOFT = 'rgba(255,255,255,0.13)';
const SHADE = 'rgba(0,0,0,0.18)';

function wedgePath(cx, cy, r, a0, a1) {
  const rad = (a) => (Math.PI / 180) * (a - 90);
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`;
}

/** Rounded tile with a letter/digit on it — reused by several word/number games. */
function Tile({ x, y, s = 22, rot = 0, label, fg = '#25264A', bg = WHITE, fontSize = 15 }) {
  return (
    <G transform={`rotate(${rot} ${x + s / 2} ${y + s / 2})`}>
      <Rect x={x} y={y} width={s} height={s} rx={5} fill={bg} />
      <SvgText
        x={x + s / 2}
        y={y + s / 2 + fontSize * 0.36}
        fontSize={fontSize}
        fontWeight="900"
        fill={fg}
        textAnchor="middle"
      >
        {label}
      </SvgText>
    </G>
  );
}

function Coin({ x, y, r = 11 }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill="#FFC93C" stroke="#D99500" strokeWidth={r * 0.24} />
      <SvgText x={x} y={y + r * 0.38} fontSize={r * 1.1} fontWeight="900" fill="#8A5A00" textAnchor="middle">
        ₹
      </SvgText>
    </G>
  );
}

/* ----------------------------------------------------------------- 1. Spin */
const WHEEL = ['#F5476B', '#FFC93C', '#4ECDC4', '#845EC2', '#FF8C42', '#2EC4B6', '#FF5D8F', '#3D9DF2'];
function LuckySpin() {
  const cx = 50;
  const cy = 55;
  const r = 30;
  return (
    <>
      <Circle cx={cx} cy={cy} r={r + 4} fill={WHITE} />
      {WHEEL.map((c, i) => (
        <Path key={c + i} d={wedgePath(cx, cy, r, i * 45, (i + 1) * 45)} fill={c} />
      ))}
      <Circle cx={cx} cy={cy} r={7} fill="#26243D" />
      <Circle cx={cx} cy={cy} r={2.8} fill="#8BE3FF" />
      <Path d="M50 14 L43 27 L57 27 Z" fill={WHITE} />
    </>
  );
}

/* ------------------------------------------------------------------ 2. Quiz */
function QuizRush() {
  // Scalloped outline so it reads as a brain rather than a smooth dome.
  return (
    <>
      <Path
        d="M50 16 C43 16 38 20 36 24 C29 22 23 27 23 34 C17 36 15 44 20 49 C16 54 19 62 26 63
           C28 69 34 72 40 70 L40 80 L60 80 L60 70 C66 72 72 69 74 63 C81 62 84 54 80 49
           C85 44 83 36 77 34 C77 27 71 22 64 24 C62 20 57 16 50 16 Z"
        fill={GLASS}
        stroke={WHITE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Line x1={50} y1={19} x2={50} y2={80} stroke={WHITE} strokeWidth={2.4} strokeOpacity={0.75} />
      <Path d="M41 30 Q33 36 41 42 Q33 48 41 56" stroke={WHITE} strokeWidth={2.6} fill="none" strokeOpacity={0.85} />
      <Path d="M59 30 Q67 36 59 42 Q67 48 59 56" stroke={WHITE} strokeWidth={2.6} fill="none" strokeOpacity={0.85} />
      <Rect x={41} y={80} width={18} height={5} rx={2} fill={WHITE} opacity={0.8} />
    </>
  );
}

/* --------------------------------------------------------------- 3. Scratch */
function ScratchTicket() {
  const hatch = [];
  for (let i = 0; i < 6; i++) {
    const off = 22 + i * 10;
    hatch.push(
      <Line
        key={i}
        x1={off}
        y1={66}
        x2={off + 20}
        y2={34}
        stroke={WHITE}
        strokeOpacity={0.34}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    );
  }
  return (
    <>
      <Rect x={16} y={30} width={58} height={40} rx={8} fill={GLASS} stroke={WHITE} strokeWidth={3} />
      {hatch}
      <Rect x={16} y={30} width={58} height={40} rx={8} fill="none" stroke={WHITE} strokeWidth={3} />
      <Coin x={74} y={58} r={13} />
    </>
  );
}

/* ------------------------------------------------------------------- 4. Tap */
function TapBlast() {
  const spikes = [];
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 180) * (i * 30);
    const r0 = 20;
    const r1 = i % 2 === 0 ? 34 : 27;
    spikes.push(
      <Line
        key={i}
        x1={50 + r0 * Math.cos(a)}
        y1={50 + r0 * Math.sin(a)}
        x2={50 + r1 * Math.cos(a)}
        y2={50 + r1 * Math.sin(a)}
        stroke={WHITE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeOpacity={i % 2 === 0 ? 0.95 : 0.55}
      />
    );
  }
  return (
    <>
      <Circle cx={50} cy={50} r={19} fill={WHITE} />
      <Circle cx={50} cy={50} r={11} fill="#FF7043" />
      {spikes}
    </>
  );
}

/* ---------------------------------------------------------------- 5. Memory */
function MemoryMatch() {
  return (
    <>
      <G transform="rotate(-12 38 54)">
        <Rect x={22} y={28} width={32} height={46} rx={6} fill={WHITE} />
        <Rect x={26} y={32} width={24} height={38} rx={4} fill="none" stroke="#C9CEF2" strokeWidth={2} />
        <SvgText x={38} y={58} fontSize={20} fontWeight="900" fill="#5D3FD3" textAnchor="middle">?</SvgText>
      </G>
      <G transform="rotate(11 66 54)">
        <Rect x={50} y={28} width={32} height={46} rx={6} fill={WHITE} />
        <Path
          d="M66 38 L69.5 46 L78 46 L71 51 L74 60 L66 55 L58 60 L61 51 L54 46 L62.5 46 Z"
          fill="#FFB300"
        />
      </G>
    </>
  );
}

/* ---------------------------------------------------------------- 6. Runner */
function CoinRunner() {
  return (
    <>
      <Circle cx={40} cy={26} r={8} fill={WHITE} />
      <Path d="M40 34 L40 54" stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
      <Path d="M40 40 L54 34" stroke={WHITE} strokeWidth={6} strokeLinecap="round" />
      <Path d="M40 40 L28 48" stroke={WHITE} strokeWidth={6} strokeLinecap="round" />
      <Path d="M40 54 L50 70" stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
      <Path d="M40 54 L26 66" stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
      <Line x1={14} y1={80} x2={86} y2={80} stroke={WHITE} strokeWidth={4} strokeOpacity={0.5} strokeLinecap="round" />
      <Coin x={74} y={34} r={9} />
      <Coin x={80} y={58} r={7} />
    </>
  );
}

/* ----------------------------------------------------------- 7. Number Rush */
function NumberRush() {
  return (
    <>
      <Tile x={14} y={40} s={24} rot={-10} label="7" fontSize={16} />
      <Tile x={38} y={26} s={26} rot={4} label="3" fontSize={18} />
      <Tile x={64} y={42} s={24} rot={12} label="9" fontSize={16} />
      <Line x1={20} y1={76} x2={80} y2={76} stroke={WHITE} strokeWidth={3.5} strokeOpacity={0.45} strokeLinecap="round" />
    </>
  );
}

/* ------------------------------------------------------------ 8. Bubble Pop */
function BubblePop() {
  const bubble = (cx, cy, r) => (
    <G key={`${cx}-${cy}`}>
      <Circle cx={cx} cy={cy} r={r} fill={GLASS} stroke={WHITE} strokeWidth={2.6} />
      <Circle cx={cx - r * 0.32} cy={cy - r * 0.34} r={r * 0.22} fill={WHITE} opacity={0.9} />
    </G>
  );
  return (
    <>
      {bubble(34, 38, 16)}
      {bubble(68, 30, 11)}
      {bubble(64, 62, 18)}
      {bubble(28, 70, 10)}
    </>
  );
}

/* ------------------------------------------------------------ 9. Color Match */
function ColorMatch() {
  return (
    <>
      <Path
        d="M50 20 C30 20 18 33 18 50 C18 63 28 70 38 70 C44 70 44 62 50 62 C60 62 82 60 82 44 C82 30 68 20 50 20 Z"
        fill={WHITE}
      />
      <Circle cx={36} cy={36} r={5.5} fill="#F5476B" />
      <Circle cx={54} cy={31} r={5.5} fill="#3D9DF2" />
      <Circle cx={67} cy={43} r={5.5} fill="#FFC93C" />
      <Circle cx={34} cy={54} r={5.5} fill="#2EC4B6" />
      <Path d="M62 76 L84 54" stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
      <Path d="M58 80 L66 72" stroke="#FF8C42" strokeWidth={9} strokeLinecap="round" />
    </>
  );
}

/* -------------------------------------------------------- 10. Word Scramble */
function WordScramble() {
  return (
    <>
      <Tile x={12} y={34} s={23} rot={-12} label="W" fontSize={13} />
      <Tile x={36} y={24} s={23} rot={6} label="O" fontSize={13} />
      <Tile x={60} y={32} s={23} rot={-6} label="R" fontSize={13} />
      <Tile x={38} y={54} s={23} rot={14} label="D" fontSize={13} />
    </>
  );
}

/* ---------------------------------------------------------- 11. True / False */
function TrueFalse() {
  return (
    <>
      <Circle cx={34} cy={50} r={20} fill={WHITE} />
      <Path
        d="M25 51 L31.5 58 L44 41"
        stroke="#1FBF62"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={70} cy={50} r={16} fill={GLASS} stroke={WHITE} strokeWidth={3} />
      <Path d="M63 43 L77 57 M77 43 L63 57" stroke={WHITE} strokeWidth={5} strokeLinecap="round" />
    </>
  );
}

/* ----------------------------------------------------------- 12. Emoji Riddle */
function EmojiRiddle() {
  // One clear jigsaw piece (knob on top, knob on right, socket on left) with a
  // second piece tucked behind it.
  const piece =
    'M32 34 L43 34 A7 7 0 1 1 57 34 L68 34 L68 45 A7 7 0 1 0 68 59 L68 70 L32 70 L32 59 A7 7 0 1 1 32 45 Z';
  return (
    <>
    <G transform="translate(50 52) scale(1.35) translate(-50 -52)">
      <G transform="rotate(-14 40 60)">
        <Path d={piece} fill={GLASS} stroke={WHITE} strokeWidth={2.2} strokeLinejoin="round" opacity={0.75} />
      </G>
      <Path d={piece} fill={WHITE} />
      <SvgText x={50} y={59} fontSize={22} fontWeight="900" fill="#7B4FBF" textAnchor="middle">?</SvgText>
    </G>
    </>
  );
}

/* ------------------------------------------------------------ 13. Odd One Out */
function OddOneOut() {
  return (
    <>
      <Rect x={18} y={22} width={22} height={22} rx={4} fill={WHITE} opacity={0.85} />
      <Rect x={50} y={22} width={22} height={22} rx={4} fill={WHITE} opacity={0.85} />
      <Rect x={18} y={54} width={22} height={22} rx={4} fill={WHITE} opacity={0.85} />
      <Circle cx={61} cy={65} r={11} fill="#FFC93C" />
      <Circle cx={61} cy={65} r={17} fill="none" stroke={WHITE} strokeWidth={4} />
      <Line x1={73} y1={77} x2={86} y2={88} stroke={WHITE} strokeWidth={5} strokeLinecap="round" />
    </>
  );
}

/* ------------------------------------------------------------- 14. Reflex Tap */
function ReflexTap() {
  return (
    <>
      <Circle cx={50} cy={50} r={34} fill="none" stroke={WHITE} strokeWidth={2.5} strokeOpacity={0.3} />
      <Circle cx={50} cy={50} r={25} fill="none" stroke={WHITE} strokeWidth={2.5} strokeOpacity={0.5} />
      <Path d="M56 16 L32 54 L47 54 L42 84 L68 44 L52 44 Z" fill={WHITE} />
    </>
  );
}

/* --------------------------------------------------------- 15. Whack-a-Mole */
function WhackAMole() {
  return (
    <>
      {/* hole the mole pops out of */}
      <Ellipse cx={36} cy={74} rx={22} ry={8} fill={SHADE} />
      {/* mole head + ears, eyes, snout */}
      <Circle cx={27} cy={53} r={5} fill={WHITE} opacity={0.9} />
      <Circle cx={45} cy={53} r={5} fill={WHITE} opacity={0.9} />
      <Circle cx={36} cy={60} r={15} fill={WHITE} />
      <Circle cx={31} cy={57} r={2.4} fill="#3B2A20" />
      <Circle cx={41} cy={57} r={2.4} fill="#3B2A20" />
      <Ellipse cx={36} cy={65} rx={5} ry={3.6} fill="#E08A9B" />
      <Circle cx={34.2} cy={64.4} r={1} fill="#3B2A20" />
      <Circle cx={37.8} cy={64.4} r={1} fill="#3B2A20" />
      {/* hammer coming down from the top right */}
      <G transform="rotate(34 72 44)">
        <Rect x={68} y={40} width={8} height={40} rx={4} fill="#F1E4D0" />
        <Rect x={56} y={22} width={32} height={18} rx={5} fill="#E8EAF6" />
        <Rect x={56} y={22} width={32} height={18} rx={5} fill="none" stroke={WHITE} strokeWidth={2.5} />
      </G>
    </>
  );
}

/* ------------------------------------------------------------ 16. Balloon Burst */
function BalloonBurst() {
  const balloon = (cx, cy, r, fill) => (
    <G key={`${cx}-${cy}`}>
      <Path d={`M${cx} ${cy + r} Q${cx} ${cy + r + 14} ${cx + 5} ${cy + r + 24}`} stroke={WHITE} strokeWidth={2} fill="none" />
      <Ellipse cx={cx} cy={cy} rx={r * 0.86} ry={r} fill={fill} />
      <Path d={`M${cx - 3} ${cy + r} L${cx + 3} ${cy + r} L${cx} ${cy + r + 4} Z`} fill={fill} />
      <Ellipse cx={cx - r * 0.3} cy={cy - r * 0.34} rx={r * 0.17} ry={r * 0.24} fill={WHITE} opacity={0.75} />
    </G>
  );
  return (
    <>
      {balloon(30, 38, 15, '#FF6FB5')}
      {balloon(68, 32, 13, '#FFC93C')}
      {balloon(50, 56, 16, '#4ECDC4')}
    </>
  );
}

/* ------------------------------------------------------------ 17. Sequence Tap */
function SequenceTap() {
  return (
    <>
      <Tile x={16} y={20} s={24} label="1" bg={WHITE} fontSize={14} />
      <Tile x={58} y={20} s={24} label="2" bg="rgba(255,255,255,0.55)" fontSize={14} />
      <Tile x={58} y={58} s={24} label="3" bg="rgba(255,255,255,0.55)" fontSize={14} />
      <Tile x={16} y={58} s={24} label="4" bg="rgba(255,255,255,0.55)" fontSize={14} />
      <Path
        d="M42 32 L56 32 M70 44 L70 56 M56 70 L44 70"
        stroke={WHITE}
        strokeWidth={3}
        strokeLinecap="round"
        strokeOpacity={0.85}
      />
    </>
  );
}

/* -------------------------------------------------------------- 18. Simon Says */
function SimonSays() {
  return (
    <>
      <Circle cx={50} cy={50} r={33} fill={WHITE} />
      <Path d={wedgePath(50, 50, 30, 0, 90)} fill="#F5476B" />
      <Path d={wedgePath(50, 50, 30, 90, 180)} fill="#FFC93C" />
      <Path d={wedgePath(50, 50, 30, 180, 270)} fill="#2EC4B6" />
      <Path d={wedgePath(50, 50, 30, 270, 360)} fill="#3D9DF2" />
      <Circle cx={50} cy={50} r={11} fill="#26243D" />
      <Circle cx={50} cy={50} r={4} fill={WHITE} opacity={0.7} />
    </>
  );
}

/* --------------------------------------------------------------- 19. Lucky Dice */
function LuckyDice() {
  const pip = (x, y, k) => <Circle key={k} cx={x} cy={y} r={2.7} fill="#25264A" />;
  return (
    <>
      <G transform="rotate(-12 36 52)">
        <Rect x={18} y={34} width={36} height={36} rx={8} fill={WHITE} />
        {pip(28, 44, 'a')}
        {pip(44, 44, 'b')}
        {pip(36, 52, 'c')}
        {pip(28, 60, 'd')}
        {pip(44, 60, 'e')}
      </G>
      <G transform="rotate(14 68 62)">
        <Rect x={52} y={44} width={32} height={32} rx={7} fill="rgba(255,255,255,0.9)" />
        {pip(61, 53, 'f')}
        {pip(75, 67, 'g')}
        {pip(68, 60, 'h')}
      </G>
    </>
  );
}

/* --------------------------------------------------------------- 20. Coin Flip */
function CoinFlip() {
  return (
    <>
      <Path
        d="M22 62 A28 28 0 0 1 50 34"
        stroke={WHITE}
        strokeWidth={3}
        fill="none"
        strokeOpacity={0.45}
        strokeLinecap="round"
      />
      <Path d="M50 30 L44 40 L56 40 Z" fill={WHITE} opacity={0.55} />
      {/* the same coin edge-on, mid-flip, above the face-on coin */}
      <Ellipse cx={62} cy={24} rx={17} ry={5} fill="#FFC93C" stroke="#D99500" strokeWidth={3} />
      <Ellipse cx={58} cy={58} rx={22} ry={22} fill="#FFC93C" stroke="#D99500" strokeWidth={5} />
      <SvgText x={58} y={67} fontSize={24} fontWeight="900" fill="#8A5A00" textAnchor="middle">₹</SvgText>
    </>
  );
}

function Fallback() {
  return (
    <>
      <Circle cx={50} cy={50} r={28} fill={GLASS} stroke={WHITE} strokeWidth={3} />
      <Path d="M50 34 L56 48 L71 48 L59 57 L64 72 L50 63 L36 72 L41 57 L29 48 L44 48 Z" fill={WHITE} />
    </>
  );
}

const ART = {
  spin: LuckySpin,
  quiz: QuizRush,
  scratch: ScratchTicket,
  tap: TapBlast,
  memory: MemoryMatch,
  runner: CoinRunner,
  numberRush: NumberRush,
  bubblePop: BubblePop,
  colorMatch: ColorMatch,
  wordScramble: WordScramble,
  trueFalse: TrueFalse,
  emojiRiddle: EmojiRiddle,
  oddOneOut: OddOneOut,
  reflexTap: ReflexTap,
  whackAMole: WhackAMole,
  balloonBurst: BalloonBurst,
  sequenceTap: SequenceTap,
  simonSays: SimonSays,
  luckyDice: LuckyDice,
  coinFlip: CoinFlip,
};

// Fills whatever box the parent gives it, so tile sizing stays a layout concern.
export default function GameArt({ name }) {
  const Art = ART[name] || Fallback;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100">
      <Art />
    </Svg>
  );
}
