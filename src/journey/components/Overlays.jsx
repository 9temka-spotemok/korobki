import {
  APPLICATIONS,
  BOX_TYPES,
  EVO_PIZZA_GATE,
  MANUFACTURING,
  PRINT_MODES,
  SECTIONS,
  TRUST_STATS,
  sectionProgress,
  smoothstep,
} from '../data/story'

function opacityIn(progress, start, end, fade = 0.18, { holdEnd = false } = {}) {
  const p = sectionProgress(progress, start, end)
  // Sections that begin at scroll 0 must be visible immediately (no fade-in from empty).
  const enter = start <= 0 ? 1 : smoothstep(0, fade, p)
  const leave = holdEnd ? 1 : 1 - smoothstep(1 - fade, 1, p)
  return Math.max(0, enter * leave)
}

function Stage({ progress, start, end, children, className = '', align = 'left', holdEnd = false }) {
  const o = opacityIn(progress, start, end, 0.18, { holdEnd })
  if (o < 0.02) return null
  return (
    <div
      className={`journey-stage journey-stage--${align} ${className}`}
      style={{ opacity: o, '--journey-rise': `${(1 - o) * 18}px` }}
    >
      {children}
    </div>
  )
}

export function Overlays({ progress, children }) {
  const evoP = sectionProgress(progress, SECTIONS.evolution.start, SECTIONS.evolution.end)
  const evoIndex =
    evoP >= EVO_PIZZA_GATE
      ? BOX_TYPES.length - 1
      : Math.min(
          BOX_TYPES.length - 2,
          Math.floor((evoP / EVO_PIZZA_GATE) * Math.max(1, BOX_TYPES.length - 1)),
        )
  const mfgP = sectionProgress(progress, SECTIONS.manufacturing.start, SECTIONS.manufacturing.end)
  const mfgIndex = Math.min(MANUFACTURING.length - 1, Math.floor(mfgP * MANUFACTURING.length))
  const printP = sectionProgress(progress, SECTIONS.printing.start, SECTIONS.printing.end)
  const printIndex = Math.min(PRINT_MODES.length - 1, Math.floor(printP * PRINT_MODES.length))
  const appP = sectionProgress(progress, SECTIONS.applications.start, SECTIONS.applications.end)
  const appIndex = Math.min(APPLICATIONS.length - 1, Math.floor(appP * APPLICATIONS.length))

  return (
    <div className="journey-overlays">
      <Stage progress={progress} start={SECTIONS.hero.start} end={SECTIONS.fold.end} align="center" className="journey-stage--hero">
        <p className="journey-eyebrow">БАЛТКАРТОН</p>
        <h1>Упаковка, которая защищает продукт.</h1>
        <p className="journey-sub">От гофрокартона до индивидуальной упаковки.</p>
        <a className="journey-cta" href="contacts.html#order">
          Оставить заявку
        </a>
      </Stage>

      <Stage progress={progress} start={SECTIONS.evolution.start} end={SECTIONS.evolution.end} align="left">
        <p className="journey-eyebrow">Эволюция короба</p>
        <h2>{BOX_TYPES[evoIndex].label}</h2>
        <p className="journey-sub">Один объект. Разные геометрии. Плавный морф под каждое применение.</p>
      </Stage>

      <Stage progress={progress} start={SECTIONS.manufacturing.start} end={SECTIONS.manufacturing.end} align="right">
        <p className="journey-eyebrow">Производство</p>
        <h2>{MANUFACTURING[mfgIndex]}</h2>
        <p className="journey-sub">От листа картона до готовой упаковки — одна непрерывная линия.</p>
        <ul className="journey-steps">
          {MANUFACTURING.map((step, i) => (
            <li key={step} className={i === mfgIndex ? 'is-active' : ''}>
              {step}
            </li>
          ))}
        </ul>
      </Stage>

      <Stage
        progress={progress}
        start={SECTIONS.printing.start}
        end={SECTIONS.printing.end}
        align="left"
        className="journey-stage--print"
      >
        <p className="journey-eyebrow">Печать под бренд</p>
        <h2>Флексографическая печать</h2>
        <p className="journey-sub">Краска ложится точно. До трёх цветов — или полностью свой макет.</p>
        <div className="journey-chips">
          {PRINT_MODES.map((mode, i) => (
            <span key={mode.id} className={i === printIndex ? 'is-active' : ''}>
              {mode.label}
            </span>
          ))}
        </div>
        <a className="journey-cta" href="contacts.html#order">
          Оставить заявку
        </a>
      </Stage>

      <Stage
        progress={progress}
        start={SECTIONS.applications.start}
        end={SECTIONS.applications.end}
        align="right"
        className="journey-stage--apps"
      >
        <p className="journey-eyebrow">Применение</p>
        <h2>{APPLICATIONS[appIndex].label}</h2>
        <p className="journey-sub">Тот же крафт-картон становится защитой для самого важного.</p>
        <a className="journey-cta" href="contacts.html#order">
          Оставить заявку
        </a>
      </Stage>

      <Stage progress={progress} start={SECTIONS.configurator.start} end={SECTIONS.configurator.end} align="left" className="journey-stage--config">
        <p className="journey-eyebrow">Конфигуратор</p>
        <h2>Соберите свой короб</h2>
        <p className="journey-sub">Размеры, картон, печать, тираж — 3D-модель отвечает сразу.</p>
        {children}
      </Stage>

      <Stage progress={progress} start={SECTIONS.trust.start} end={SECTIONS.trust.end} align="center">
        <p className="journey-eyebrow">Нам доверяют</p>
        <div className="journey-stats">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="journey-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </Stage>

      <Stage progress={progress} start={SECTIONS.finale.start} end={SECTIONS.finale.end} align="center" className="journey-stage--finale" holdEnd>
        <p className="journey-eyebrow">БАЛТКАРТОН</p>
        <h2>Соберём вашу упаковку.</h2>
        <p className="journey-sub">
          Мы не просто производим картон. Мы превращаем природный материал в упаковку,
          которая защищает продукт, усиливает бренд и доходит до миллионов людей.
        </p>
        <a className="journey-cta journey-cta--finale" href="contacts.html#order">
          Оставить заявку
        </a>
      </Stage>
    </div>
  )
}
