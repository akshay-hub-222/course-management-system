import { useState } from 'react';

/** Picks an illustration style from the course's category / title. */
export function artKind(course) {
  const t = `${course.category || ''} ${course.title || ''}`.toLowerCase();
  if (/(database|sql|data)/.test(t)) return 'data';
  if (/(react|html|css|web|front)/.test(t)) return 'web';
  if (/(api|spring|backend|server|rest)/.test(t)) return 'api';
  if (/(java|program|code|python|algorithm)/.test(t)) return 'code';
  return 'generic';
}

const TONES = {
  code: ['#16245A', '#4F46E5'],
  web: ['#1B2B6B', '#6366F1'],
  api: ['#0F1F4D', '#4F6BED'],
  data: ['#1A1F5C', '#7C7CF2'],
  generic: ['#14224F', '#5B63F0'],
};

function Scene({ kind }) {
  const w = '#fff';
  switch (kind) {
    case 'code':
      return (
        <g>
          <rect x="92" y="52" width="216" height="146" rx="12" fill={w} opacity=".96" />
          <rect x="92" y="52" width="216" height="26" rx="12" fill={w} />
          <circle cx="110" cy="65" r="4" fill="#C7CCF5" /><circle cx="124" cy="65" r="4" fill="#C7CCF5" /><circle cx="138" cy="65" r="4" fill="#C7CCF5" />
          <rect x="92" y="78" width="216" height="1" fill="#E5E8F0" />
          <rect x="110" y="94" width="46" height="8" rx="4" fill="#4F46E5" />
          <rect x="164" y="94" width="70" height="8" rx="4" fill="#C7CCF5" />
          <rect x="126" y="112" width="86" height="8" rx="4" fill="#C7CCF5" />
          <rect x="220" y="112" width="40" height="8" rx="4" fill="#8B93F5" />
          <rect x="126" y="130" width="58" height="8" rx="4" fill="#8B93F5" />
          <rect x="192" y="130" width="74" height="8" rx="4" fill="#C7CCF5" />
          <rect x="110" y="148" width="104" height="8" rx="4" fill="#C7CCF5" />
          <rect x="110" y="166" width="34" height="8" rx="4" fill="#4F46E5" />
          <rect x="260" y="150" width="28" height="28" rx="8" fill="#4F46E5" />
          <path d="m269 160-5 4 5 4M279 160l5 4-5 4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'web':
      return (
        <g>
          <rect x="78" y="46" width="244" height="158" rx="12" fill={w} opacity=".97" />
          <path d="M78 58a12 12 0 0 1 12-12h220a12 12 0 0 1 12 12v18H78z" fill="#EEF0FF" />
          <circle cx="96" cy="61" r="4" fill="#C7CCF5" /><circle cx="110" cy="61" r="4" fill="#C7CCF5" /><circle cx="124" cy="61" r="4" fill="#C7CCF5" />
          <rect x="146" y="55" width="150" height="12" rx="6" fill={w} />
          <rect x="96" y="92" width="110" height="12" rx="6" fill="#1B2B6B" />
          <rect x="96" y="112" width="84" height="7" rx="3.5" fill="#C7CCF5" />
          <rect x="96" y="126" width="96" height="7" rx="3.5" fill="#C7CCF5" />
          <rect x="96" y="146" width="56" height="20" rx="10" fill="#4F46E5" />
          <rect x="226" y="92" width="80" height="74" rx="10" fill="#E0E4FF" />
          <circle cx="266" cy="118" r="14" fill="#8B93F5" />
          <path d="M226 166v-14l22-14 20 12 14-8 14 10v14z" fill="#A9B0F8" />
          <rect x="96" y="178" width="60" height="14" rx="5" fill="#EEF0FF" /><rect x="164" y="178" width="60" height="14" rx="5" fill="#EEF0FF" /><rect x="232" y="178" width="74" height="14" rx="5" fill="#EEF0FF" />
        </g>
      );
    case 'api':
      return (
        <g>
          <path d="M122 98h60M218 98h60M200 120v34M122 98l36 56M278 98l-36 56" stroke="#fff" strokeWidth="2.4" strokeDasharray="5 6" opacity=".55" fill="none" strokeLinecap="round" />
          <rect x="84" y="72" width="76" height="52" rx="12" fill={w} /><rect x="98" y="88" width="34" height="7" rx="3.5" fill="#4F46E5" /><rect x="98" y="102" width="48" height="7" rx="3.5" fill="#C7CCF5" />
          <rect x="240" y="72" width="76" height="52" rx="12" fill={w} /><rect x="254" y="88" width="34" height="7" rx="3.5" fill="#4F46E5" /><rect x="254" y="102" width="48" height="7" rx="3.5" fill="#C7CCF5" />
          <rect x="160" y="146" width="80" height="54" rx="12" fill={w} />
          <rect x="174" y="160" width="52" height="8" rx="4" fill="#4F46E5" /><rect x="174" y="176" width="34" height="8" rx="4" fill="#C7CCF5" />
          <circle cx="200" cy="98" r="22" fill="#4F46E5" />
          <path d="m191 98 6 6 12-12" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'data':
      return (
        <g>
          <g fill={w}>
            <path d="M128 74v34c0 8 33 14 72 14s72-6 72-14V74z" />
            <path d="M128 112v34c0 8 33 14 72 14s72-6 72-14v-34c0 8-33 14-72 14s-72-6-72-14z" opacity=".92" />
            <path d="M128 150v30c0 8 33 14 72 14s72-6 72-14v-30c0 8-33 14-72 14s-72-6-72-14z" opacity=".84" />
          </g>
          <ellipse cx="200" cy="74" rx="72" ry="16" fill="#E0E4FF" />
          <ellipse cx="200" cy="74" rx="72" ry="16" fill="none" stroke="#C7CCF5" />
          <g stroke="#8B93F5" strokeWidth="3" strokeLinecap="round" opacity=".9">
            <path d="M158 122c14 5 28 7 42 7s28-2 42-7" fill="none" /><path d="M158 160c14 5 28 7 42 7s28-2 42-7" fill="none" />
          </g>
          <circle cx="262" cy="86" r="3" fill="#4F46E5" /><circle cx="262" cy="130" r="3" fill="#4F46E5" /><circle cx="262" cy="168" r="3" fill="#4F46E5" />
        </g>
      );
    default:
      return (
        <g>
          <path d="m200 66 96 44-96 44-96-44z" fill="#fff" />
          <path d="m104 134 96 44 96-44" stroke="#fff" strokeWidth="14" fill="none" strokeLinejoin="round" opacity=".7" />
          <path d="m104 156 96 44 96-44" stroke="#fff" strokeWidth="14" fill="none" strokeLinejoin="round" opacity=".45" />
          <path d="m200 82 56 26-56 26-56-26z" fill="#4F46E5" opacity=".9" />
        </g>
      );
  }
}

/** Course thumbnail: uploaded image when available, otherwise a generated illustration. */
export default function CourseArt({ course, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (course.imageUrl && !broken) {
    return (
      <div className={`art ${className}`}>
        <img src={course.imageUrl} alt="" loading="lazy" onError={() => setBroken(true)} />
      </div>
    );
  }
  const kind = artKind(course);
  const [bg, glow] = TONES[kind];
  return (
    <div className={`art ${className}`}>
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${course.title} illustration`}>
        <rect width="400" height="250" fill={bg} />
        <circle cx="352" cy="22" r="120" fill={glow} opacity=".28" />
        <circle cx="30" cy="250" r="110" fill={glow} opacity=".22" />
        <g stroke="#fff" opacity=".07">
          {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="250" />)}
          {Array.from({ length: 6 }).map((_, i) => <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} />)}
        </g>
        <Scene kind={kind} />
      </svg>
    </div>
  );
}
