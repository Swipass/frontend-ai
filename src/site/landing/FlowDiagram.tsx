// src/site/landing/FlowDiagram.tsx
// How a command becomes a settled transaction, drawn as a roles diagram: four
// parties around the Swipass router, joined by labelled flows. Stacks into a
// vertical sequence on small screens.
import { useRef, type CSSProperties } from 'react'
import { useInView } from '../hooks'
import { Reveal, SectionIntro } from '../ui'
import './flow.css'

const INK = '#262626'
type Arrow = 'none' | 'left' | 'right' | 'both'

function chipPoints(x: number, y: number, w: number, h: number, arrow: Arrow): string {
  const n = 11
  const mid = y + h / 2
  const left = arrow === 'left' || arrow === 'both' ? `${x + n},${y + h} ${x},${mid} ${x + n},${y}` : `${x},${y + h} ${x},${y}`
  const right = arrow === 'right' || arrow === 'both' ? `${x + w - n},${y} ${x + w},${mid} ${x + w - n},${y + h}` : `${x + w},${y} ${x + w},${y + h}`
  return `${left} ${right}`
}

function Chip({ x, y, w, label, arrow = 'none', delay = 0 }: { x: number; y: number; w: number; label: string; arrow?: Arrow; delay?: number }) {
  const h = 26
  return (
    <g className="flow-piece" style={{ transitionDelay: `${delay}ms` } as CSSProperties}>
      <polygon points={chipPoints(x, y + 3, w, h, arrow)} fill="#9c9c9c" />
      <polygon points={chipPoints(x, y, w, h, arrow)} fill="#efefef" stroke={INK} strokeWidth="1" />
      <text x={x + w / 2} y={y + 17} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="10" letterSpacing="1.1" fill={INK}>
        {label}
      </text>
    </g>
  )
}

// A block with one concave corner facing the router. Flips per quadrant.
function Block({ x, y, label, flipX = false, flipY = false }: { x: number; y: number; label: string; flipX?: boolean; flipY?: boolean }) {
  const [w, h] = [190, 118]
  const transform = `translate(${x + (flipX ? w : 0)} ${y + (flipY ? h : 0)}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1})`
  return (
    <g className="flow-piece">
      <g transform={transform}>
        <path d="M0 4 H190 V42 C120 42 84 74 84 122 H0 Z" fill="#8f8f8f" />
        <path d="M0 0 H190 V38 C120 38 84 70 84 118 H0 Z" fill="#cdcdcd" stroke={INK} strokeWidth="1.2" />
        <path d="M190 47 C127 47 93 77 93 118" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.55" />
      </g>
      <text
        x={flipX ? x + w - 20 : x + 20}
        y={flipY ? y + h - 12 : y + 28}
        textAnchor={flipX ? 'end' : 'start'}
        fontFamily="Instrument Serif, Georgia, serif"
        fontSize="21"
        letterSpacing="0.6"
        fill="#0a0a0a"
      >
        {label}
      </text>
    </g>
  )
}

const FLOWS: { d: string; reverse?: boolean }[] = [
  { d: 'M240 51 H400' }, { d: 'M600 51 H760' },
  { d: 'M760 85 H580', reverse: true }, { d: 'M420 85 H240', reverse: true },
  { d: 'M216 213 H374' }, { d: 'M374 353 H236', reverse: true },
  { d: 'M784 213 H626', reverse: true }, { d: 'M764 353 H626', reverse: true },
  { d: 'M384 502 H240', reverse: true }, { d: 'M616 502 H760' },
]

const CONNECTORS = ['M52 158 V200', 'M52 366 V402', 'M948 158 V200', 'M948 366 V402', 'M500 438 V488']

const STEPS = [
  { role: 'You', text: 'Speak or type a command, for example "Bridge 1 ETH from Arbitrum to Polygon".', flow: 'Plain-language intent' },
  { role: 'Swipass Router', text: 'Parses the intent into a validated plan, then asks every provider for a quote at once.', flow: 'Live quotes' },
  { role: 'Providers', text: '0x, LI.FI, Across and the rest return routes. Each is scored on output, speed and history.', flow: 'Best route' },
  { role: 'Simulator', text: 'The winning route is simulated against live chain state before you are asked to sign.', flow: 'One signature' },
  { role: 'Chains', text: 'The transaction settles on-chain, with the minimum output fixed in the calldata.', flow: '' },
]

const PHASES = [
  { n: '01', word: 'Speak', text: 'Connect your wallet and say what you need, or type it. No account, no KYC.' },
  { n: '02', word: 'Swipe', text: 'Review the optimal quote from the provider network and confirm with a single wallet signature.' },
  { n: '03', word: 'Settle', text: 'Bridging, routing and settlement happen automatically. Assets arrive at the destination address.' },
]

export function FlowDiagram() {
  const stageRef = useRef<HTMLDivElement>(null)
  const live = useInView(stageRef, { once: false, rootMargin: '0px' })

  return (
    <section id="how-it-works" className="px-2 sm:px-4 lg:px-6">
      <div className="paper relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.6rem] px-5 py-20 sm:rounded-[2.2rem] sm:px-10 sm:py-28">
        <div ref={stageRef} className={live ? 'flow-live' : ''}>
          <svg viewBox="0 0 1000 560" className="mx-auto hidden w-full max-w-[1080px] lg:block" role="img" aria-labelledby="flow-title">
            <title id="flow-title">You, providers, a simulator and the chains, connected through the Swipass router</title>
            <defs>
              <marker id="flow-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M1 1 7 4 1 7" fill="none" stroke={INK} strokeWidth="1.2" />
              </marker>
            </defs>

            {FLOWS.map((flow) => (
              <path key={flow.d} d={flow.d} className="flow-dash" fill="none" stroke={INK} strokeWidth="1" markerEnd="url(#flow-arrow)" />
            ))}
            {CONNECTORS.map((d) => (
              <path key={d} d={d} fill="none" stroke={INK} strokeWidth="1" />
            ))}
            {FLOWS.filter((_, i) => i % 2 === 0).map((flow, i) => (
              <circle key={flow.d} r="2.6" fill="#0a0a0a" opacity={live ? 0.85 : 0}>
                <animateMotion dur="2.8s" begin={`${i * 0.5}s`} repeatCount="indefinite" path={flow.d} />
              </circle>
            ))}

            <Block x={40} y={40} label="YOU" />
            <Block x={770} y={40} label="PROVIDERS" flipX />
            <Block x={40} y={402} label="CHAINS" flipY />
            <Block x={770} y={402} label="SIMULATOR" flipX flipY />

            <g className="flow-piece" style={{ transitionDelay: '150ms' }}>
              <ellipse cx="500" cy="290" rx="118" ry="156" fill="#1a1a1a" />
              <ellipse cx="500" cy="280" rx="118" ry="156" fill="#c4c4c4" stroke={INK} strokeWidth="1.2" />
              <ellipse cx="500" cy="280" rx="106" ry="144" fill="none" stroke={INK} strokeWidth="3.2" className="rope" />
              <ellipse cx="500" cy="280" rx="98" ry="136" fill="#d6d6d6" stroke={INK} strokeWidth="0.8" />
              <text x="500" y="284" textAnchor="middle" fontFamily="Instrument Serif, Georgia, serif" fontSize="27" fill="#0a0a0a">
                Swipass Router
              </text>
              <text x="500" y="308" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="9" letterSpacing="1.6" fill="#525252">
                INTENT ENGINE
              </text>
            </g>

            <Chip x={400} y={38} w={200} label="PLAIN-LANGUAGE INTENT" delay={250} />
            <Chip x={420} y={72} w={160} label="SCORED QUOTES" delay={320} />
            <Chip x={40} y={200} w={172} label="ONE SIGNATURE" arrow="right" delay={400} />
            <Chip x={40} y={340} w={192} label="ON-CHAIN SETTLEMENT" arrow="left" delay={470} />
            <Chip x={788} y={200} w={172} label="LIVE QUOTES" arrow="left" delay={540} />
            <Chip x={768} y={340} w={192} label="PRE-FLIGHT SIMULATION" arrow="left" delay={610} />
            <Chip x={384} y={488} w={232} label="MINIMUM OUTPUT GUARANTEED" arrow="both" delay={680} />
          </svg>

          <ol className="mx-auto flex max-w-md flex-col lg:hidden">
            {STEPS.map((step, i) => (
              <li key={step.role} className="flow-piece" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="rounded-2xl rounded-br-[3rem] border border-[color:var(--line-2)] bg-[#d2d2d2] p-5 shadow-[0_3px_0_#9a9a9a]">
                  <div className="f-serif text-[1.5rem] uppercase tracking-wide text-[color:var(--ink)]">{step.role}</div>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-[color:var(--ink-3)]">{step.text}</p>
                </div>
                {step.flow && (
                  <div className="flex flex-col items-center py-2">
                    <span className="step-line h-5 w-px" />
                    <span className="f-mono border border-[color:var(--ink-2)] bg-[#efefef] px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--ink-2)] shadow-[0_3px_0_#9c9c9c]">
                      {step.flow}
                    </span>
                    <span className="step-line h-5 w-px" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        <SectionIntro
          align="center"
          className="mt-16 sm:mt-20"
          kicker="How it works"
          title={<span className="f-serif">Where words become transactions</span>}
        />

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 border-t border-[color:var(--line)] pt-10 sm:grid-cols-3">
          {PHASES.map((phase, i) => (
            <Reveal key={phase.n} delay={i * 100}>
              <div className="f-mono text-[0.72rem] text-[color:var(--ink-4)]">{phase.n}</div>
              <div className="mt-2 text-2xl font-light tracking-[-0.03em] text-[color:var(--ink)]">{phase.word}</div>
              <p className="f-mono mt-3 text-[0.8rem] leading-relaxed text-[color:var(--ink-3)]">{phase.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
