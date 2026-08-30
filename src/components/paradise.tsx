/**
 * مشهد «جنة» رمزي واحد تراكمي — يتّسع ويزداد حياةً كلما تراكمت الأعمال.
 * تمثيل تحفيزي بصري فقط، لا يدّعي أجراً ولا قبولاً.
 */

function rnd(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export type ParadiseCounts = {
  palms: number;
  flowers: number;
  jewels: number;
  palaces: number;
  rivers: number;
};

export function paradiseCounts(lifetime: number): ParadiseCounts {
  return {
    palms: Math.min(14, Math.floor(lifetime / 4)),
    flowers: Math.min(60, Math.floor(lifetime / 2)),
    jewels: Math.min(24, Math.floor(lifetime / 6)),
    palaces: Math.min(5, Math.floor(lifetime / 25)),
    rivers: lifetime >= 12 ? 2 : lifetime >= 3 ? 1 : 0,
  };
}

function Palm({ x, y, s, i }: { x: number; y: number; s: number; i: number }) {
  const fronds = [-72, -38, -8, 18, 46, 74];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="animate-sway" style={{ animationDelay: `${(i % 6) * 0.7}s`, transformOrigin: `${x}px ${y}px` }}>
      <path d="M0 0 C -6 -40 6 -80 0 -120" stroke="oklch(0.44 0.07 70)" strokeWidth="9" fill="none" strokeLinecap="round" />
      {fronds.map((a, k) => (
        <path
          key={k}
          d="M0 -120 q 45 -18 82 6 q -44 -2 -82 12 Z"
          fill={k % 2 ? "oklch(0.55 0.14 152)" : "oklch(0.64 0.16 148)"}
          transform={`rotate(${a} 0 -120)`}
        />
      ))}
      <circle cx="6" cy="-112" r="6" fill="oklch(0.78 0.14 75)" />
      <circle cx="-8" cy="-108" r="5" fill="oklch(0.72 0.15 60)" />
    </g>
  );
}

function Palace({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-60" y="-90" width="120" height="90" rx="8" fill="oklch(0.95 0.03 95)" />
      <rect x="-60" y="-90" width="120" height="90" rx="8" fill="url(#shine)" opacity="0.5" />
      {[-45, 0, 45].map((cx) => (
        <g key={cx}>
          <rect x={cx - 16} y="-124" width="32" height="40" rx="5" fill="oklch(0.92 0.04 95)" />
          <path d={`M${cx - 20} -124 q 20 -34 40 0 Z`} fill="oklch(0.8 0.13 85)" />
          <circle cx={cx} cy="-160" r="4" fill="oklch(0.85 0.14 90)" />
        </g>
      ))}
      <path d="M-16 0 v-42 a16 16 0 0 1 32 0 V0 Z" fill="oklch(0.5 0.09 158)" />
      {[-38, 38].map((cx) => (
        <rect key={cx} x={cx - 9} y="-58" width="18" height="26" rx="9" fill="oklch(0.62 0.09 200)" />
      ))}
    </g>
  );
}

function Flower({ x, y, s, i }: { x: number; y: number; s: number; i: number }) {
  const hues = ["oklch(0.78 0.17 20)", "oklch(0.85 0.15 90)", "oklch(0.75 0.14 330)", "oklch(0.82 0.13 55)", "oklch(0.8 0.12 290)"];
  const c = hues[i % hues.length];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="animate-sway" style={{ animationDelay: `${(i % 9) * 0.35}s`, transformOrigin: `${x}px ${y}px` }}>
      <path d="M0 0 v-16" stroke="oklch(0.55 0.12 150)" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-22" rx="3.6" ry="6" fill={c} transform={`rotate(${a} 0 -16)`} />
      ))}
      <circle cx="0" cy="-16" r="3" fill="oklch(0.9 0.13 95)" />
    </g>
  );
}

function Jewel({ x, y, s, i }: { x: number; y: number; s: number; i: number }) {
  const cols = ["oklch(0.85 0.13 200)", "oklch(0.82 0.16 320)", "oklch(0.88 0.14 100)", "oklch(0.8 0.14 150)"];
  const c = cols[i % cols.length];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -14 L11 -3 L0 16 L-11 -3 Z" fill={c} opacity="0.95" />
      <path d="M0 -14 L11 -3 L0 -1 Z" fill="oklch(0.99 0.02 95)" opacity="0.75" />
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" additive="sum" />
    </g>
  );
}

export function ParadiseScene({ lifetime, className = "" }: { lifetime: number; className?: string }) {
  const c = paradiseCounts(lifetime);

  return (
    <svg
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMid meet"
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label="مشهد جنة رمزي يكبر مع تراكم الأعمال"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.93 0.06 210)" />
          <stop offset="55%" stopColor="oklch(0.95 0.06 120)" />
          <stop offset="100%" stopColor="oklch(0.9 0.09 130)" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.13 145)" />
          <stop offset="60%" stopColor="oklch(0.6 0.13 152)" />
          <stop offset="100%" stopColor="oklch(0.5 0.11 158)" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.88 0.07 205)" />
          <stop offset="50%" stopColor="oklch(0.78 0.1 215)" />
          <stop offset="100%" stopColor="oklch(0.86 0.08 200)" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="oklch(0.85 0.1 85)" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="sun">
          <stop offset="0%" stopColor="oklch(0.98 0.1 95)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="oklch(0.95 0.09 95)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* السماء */}
      <rect width="1200" height="720" fill="url(#sky)" />
      <circle cx="980" cy="120" r="180" fill="url(#sun)" />
      <g fill="oklch(0.99 0.01 95)" opacity="0.75">
        <ellipse cx="220" cy="110" rx="90" ry="30" />
        <ellipse cx="300" cy="126" rx="70" ry="24" />
        <ellipse cx="700" cy="80" rx="70" ry="22" />
      </g>

      {/* تلال بعيدة */}
      <path d="M0 300 q 180 -110 380 -20 q 190 90 380 -30 q 220 -110 440 30 V400 H0 Z" fill="oklch(0.7 0.09 160)" opacity="0.55" />

      {/* الأرض */}
      <path d="M0 300 h1200 V720 H0 Z" fill="url(#ground)" />

      {/* أنهار */}
      {c.rivers >= 1 ? (
        <g>
          <path d="M-40 520 q 220 -60 460 10 q 250 66 500 -18 q 160 -54 320 -6 v70 q -170 -46 -330 8 q -250 84 -510 12 q -220 -60 -440 -6 Z" fill="url(#water)" />
          <path d="M-40 540 q 240 -52 470 14 q 250 70 500 -14" stroke="oklch(0.99 0.02 200)" strokeWidth="4" fill="none" opacity="0.55">
            <animate attributeName="stroke-dasharray" values="0 40; 26 14; 0 40" dur="6s" repeatCount="indefinite" />
          </path>
        </g>
      ) : null}
      {c.rivers >= 2 ? (
        <path d="M-40 660 q 300 -50 640 6 q 300 50 640 -14 v60 H-40 Z" fill="url(#water)" opacity="0.9" />
      ) : null}

      {/* قصور */}
      {Array.from({ length: c.palaces }).map((_, i) => (
        <Palace key={i} x={140 + i * 230 + rnd(i + 3) * 40} y={370 + (i % 2) * 16} s={0.72 + rnd(i + 9) * 0.25} />
      ))}

      {/* نخيل */}
      {Array.from({ length: c.palms }).map((_, i) => (
        <Palm key={i} i={i} x={60 + ((i * 97) % 1100)} y={480 + rnd(i + 1) * 170} s={0.6 + rnd(i + 5) * 0.55} />
      ))}

      {/* ثمار كالجواهر */}
      {Array.from({ length: c.jewels }).map((_, i) => (
        <Jewel key={i} i={i} x={70 + ((i * 151) % 1080)} y={430 + rnd(i + 21) * 230} s={0.7 + rnd(i + 31) * 0.7} />
      ))}

      {/* زهور حيّة */}
      {Array.from({ length: c.flowers }).map((_, i) => (
        <Flower key={i} i={i} x={30 + ((i * 61) % 1150)} y={470 + rnd(i + 41) * 240} s={0.8 + rnd(i + 51) * 0.9} />
      ))}

      {/* طيور */}
      <g stroke="oklch(0.45 0.05 150)" strokeWidth="3" fill="none" opacity="0.6">
        <path d="M420 150 q 14 -12 28 0 q 14 -12 28 0" />
        <path d="M520 200 q 10 -9 20 0 q 10 -9 20 0" />
      </g>
    </svg>
  );
}
