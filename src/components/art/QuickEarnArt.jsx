// Original vector artwork for the Quick Earn cards. Everything is drawn with
// react-native-svg on a 100x100 viewBox so a card can render it at any size.
// Kept in one file because the pieces share the same palette helpers.
import React from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

const WHITE = 'rgba(255,255,255,0.96)';
const GLASS = 'rgba(255,255,255,0.22)';
const GLASS_SOFT = 'rgba(255,255,255,0.14)';
const INK = '#1B1D29';

/** Four-point sparkle, used to add a bit of life around an illustration. */
function Sparkle({ x, y, r = 5, fill = WHITE, opacity = 1 }) {
  const t = r * 0.26;
  return (
    <Path
      d={`M${x} ${y - r} L${x + t} ${y - t} L${x + r} ${y} L${x + t} ${y + t} L${x} ${y + r} L${x - t} ${y + t} L${x - r} ${y} L${x - t} ${y - t} Z`}
      fill={fill}
      opacity={opacity}
    />
  );
}

/** Wedge (pie slice) path — angles in degrees, 0 = 12 o'clock. */
function wedgePath(cx, cy, r, a0, a1) {
  const rad = (a) => (Math.PI / 180) * (a - 90);
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`;
}

function Flame({ x, y, s = 1, fill = '#FFC93C' }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path
        d="M0 -11 C4 -5 8 -4 8 2 A8 8 0 0 1 -8 2 C-8 -3 -3 -4 -2 -8 C0 -6 0 -9 0 -11 Z"
        fill={fill}
      />
      <Path d="M0 -4 C2 -1 3 0 3 2 A3 3 0 0 1 -3 2 C-3 0 -1 -1 0 -4 Z" fill="#FFF3C4" />
    </G>
  );
}

/* ---------------------------------------------------------------- Daily Quiz */
function DailyQuizArt() {
  return (
    <>
      <Rect x={16} y={16} width={64} height={44} rx={14} fill={GLASS} stroke={WHITE} strokeWidth={3} />
      <Path d="M34 58 L34 80 L52 61 Z" fill={GLASS} stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
      <Rect x={34} y={55} width={18} height={6} fill={GLASS} />
      <SvgText x={48} y={50} fontSize={30} fontWeight="900" fill={WHITE} textAnchor="middle">?</SvgText>
      <Sparkle x={86} y={22} r={6} />
      <Sparkle x={80} y={44} r={3.5} opacity={0.8} />
      <Sparkle x={20} y={72} r={3.5} opacity={0.8} />
    </>
  );
}

/* --------------------------------------------------------------- Spin Wheel */
const WHEEL_COLORS = ['#F5476B', '#FFC93C', '#4ECDC4', '#845EC2', '#FF8C42', '#2EC4B6', '#FF5D8F', '#3D9DF2'];

function SpinWheelArt() {
  const cx = 50;
  const cy = 54;
  const r = 31;
  return (
    <>
      <Circle cx={cx} cy={cy} r={r + 4} fill={WHITE} />
      {WHEEL_COLORS.map((c, i) => (
        <Path key={c + i} d={wedgePath(cx, cy, r, i * 45, (i + 1) * 45)} fill={c} />
      ))}
      {WHEEL_COLORS.map((_, i) => {
        const a = (Math.PI / 180) * (i * 45 - 90 + 22.5);
        return (
          <Circle
            key={`dot${i}`}
            cx={cx + (r + 2) * Math.cos(a)}
            cy={cy + (r + 2) * Math.sin(a)}
            r={1.9}
            fill="#FFD86B"
          />
        );
      })}
      <Circle cx={cx} cy={cy} r={7.5} fill="#26243D" />
      <Circle cx={cx} cy={cy} r={3} fill="#8BE3FF" />
      <Path d="M50 12 L43 25 L57 25 Z" fill={WHITE} />
    </>
  );
}

/* ------------------------------------------------------------------ Captcha */
function CaptchaArt() {
  return (
    <>
      <Rect
        x={12}
        y={14}
        width={76}
        height={36}
        rx={9}
        fill={GLASS_SOFT}
        stroke={WHITE}
        strokeWidth={2}
        strokeOpacity={0.6}
      />
      <G transform="rotate(-14 28 40)">
        <SvgText x={28} y={40} fontSize={20} fontWeight="700" fill={WHITE} textAnchor="middle">x</SvgText>
      </G>
      <G transform="rotate(9 45 38)">
        <SvgText x={45} y={38} fontSize={22} fontWeight="800" fill={WHITE} textAnchor="middle">A</SvgText>
      </G>
      <G transform="rotate(-7 60 41)">
        <SvgText x={60} y={41} fontSize={21} fontWeight="700" fill={WHITE} textAnchor="middle">7</SvgText>
      </G>
      <G transform="rotate(16 75 38)">
        <SvgText x={75} y={38} fontSize={20} fontWeight="700" fill={WHITE} textAnchor="middle">k</SvgText>
      </G>
      <Path
        d="M16 36 Q32 26 48 36 T84 32"
        stroke={WHITE}
        strokeOpacity={0.55}
        strokeWidth={2}
        fill="none"
      />
      <Rect x={20} y={58} width={60} height={22} rx={11} fill={WHITE} />
      <Rect x={25} y={62} width={14} height={14} rx={4} fill="#1FBF62" />
      <Path
        d="M28.5 69.5 L31.5 72.5 L36 65.5"
        stroke="#fff"
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <SvgText x={60} y={74} fontSize={11} fontWeight="700" fill={INK} textAnchor="middle">verified</SvgText>
    </>
  );
}

/* ---------------------------------------------------------------- Daily Poll */
function DailyPollArt() {
  return (
    <>
      <Rect x={14} y={10} width={72} height={30} rx={10} fill={GLASS} stroke={WHITE} strokeWidth={3} />
      <Path d="M30 38 L30 52 L44 40 Z" fill={GLASS} stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
      <Rect x={30} y={35} width={14} height={5} fill={GLASS} />
      <SvgText x={50} y={31} fontSize={17} fontWeight="800" fill={WHITE} textAnchor="middle">A vs B</SvgText>

      <SvgText x={18} y={62} fontSize={12} fontWeight="800" fill={WHITE} textAnchor="middle">A</SvgText>
      <Rect x={27} y={54} width={54} height={9} rx={4.5} fill="rgba(255,255,255,0.3)" />
      <Rect x={27} y={54} width={37} height={9} rx={4.5} fill={WHITE} />
      <SvgText x={88} y={62} fontSize={10} fontWeight="800" fill={WHITE} textAnchor="middle">69</SvgText>

      <SvgText x={18} y={79} fontSize={12} fontWeight="800" fill={WHITE} textAnchor="middle">B</SvgText>
      <Rect x={27} y={71} width={54} height={9} rx={4.5} fill="rgba(255,255,255,0.3)" />
      <Rect x={27} y={71} width={17} height={9} rx={4.5} fill={WHITE} />
      <SvgText x={88} y={79} fontSize={10} fontWeight="800" fill={WHITE} textAnchor="middle">31</SvgText>
    </>
  );
}

/* ------------------------------------------------------------ Free Fire Quiz */
function FireQuizArt() {
  return (
    <>
      <Circle cx={50} cy={50} r={31} fill={GLASS_SOFT} />
      <Circle cx={50} cy={50} r={31} fill="none" stroke={WHITE} strokeWidth={2} strokeOpacity={0.35} />
      <SvgText x={50} y={50} fontSize={29} fontWeight="900" fill={WHITE} textAnchor="middle">FF</SvgText>
      <SvgText x={50} y={70} fontSize={14} fontWeight="800" fill={WHITE} textAnchor="middle" opacity={0.92}>
        QUIZ
      </SvgText>
      <Flame x={24} y={24} s={1.1} />
      <Flame x={78} y={76} s={0.95} />
    </>
  );
}

/* ------------------------------------------------------------- Scratch Card */
function ScratchCardArt() {
  const hatch = [];
  for (let i = 0; i < 7; i++) {
    const off = 18 + i * 10;
    hatch.push(
      <Line
        key={`h${i}`}
        x1={off}
        y1={64}
        x2={off + 22}
        y2={30}
        stroke={WHITE}
        strokeOpacity={0.32}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    );
  }
  return (
    <>
      <Rect x={12} y={26} width={62} height={42} rx={8} fill={GLASS} stroke={WHITE} strokeWidth={3} />
      <G>{hatch}</G>
      <Rect x={12} y={26} width={62} height={42} rx={8} fill="none" stroke={WHITE} strokeWidth={3} />
      <Circle cx={74} cy={56} r={15} fill="#FFC93C" stroke="#D99500" strokeWidth={3} />
      <SvgText x={74} y={62} fontSize={16} fontWeight="900" fill="#8A5A00" textAnchor="middle">₹</SvgText>
      <Sparkle x={22} y={18} r={4} opacity={0.85} />
    </>
  );
}

const ART = {
  dailyQuiz: DailyQuizArt,
  spin: SpinWheelArt,
  captcha: CaptchaArt,
  poll: DailyPollArt,
  fireQuiz: FireQuizArt,
  scratch: ScratchCardArt,
};

// Fills whatever box the parent gives it, so tile sizing stays a layout concern.
export default function QuickEarnArt({ name }) {
  const Art = ART[name] || DailyQuizArt;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100">
      <Art />
    </Svg>
  );
}
