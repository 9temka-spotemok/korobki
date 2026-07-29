import {
  APPLICATIONS,
  BOX_TYPES,
  EVO_PIZZA_GATE,
  HERO_TRUST,
  PRINT_LEAD,
  PRINT_MODES,
  SECTIONS,
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

function ScrollHint() {
  return (
    <p className="journey-stage-hint">
      <span className="journey-stage-hint__label">Листайте вниз</span>
      <span className="journey-hint__arrow" aria-hidden="true" />
    </p>
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
  const printP = sectionProgress(progress, SECTIONS.printing.start, SECTIONS.printing.end)
  const printIndex = Math.min(PRINT_MODES.length - 1, Math.floor(printP * PRINT_MODES.length))

  return (
    <div className="journey-overlays">
      <Stage
        progress={progress}
        start={SECTIONS.hero.start}
        end={SECTIONS.fold.end}
        align="center"
        className="journey-stage--hero-cta"
      >
        <div className="journey-hero-cta-pack">
          <h1>Упаковка, которая защищает продукт</h1>
          <ScrollHint />
          <p className="journey-sub">От гофрокартона до индивидуальной упаковки</p>
          <a className="journey-cta" href="contacts.html#order">
            Оставить заявку
          </a>
          <ul className="journey-hero-trust">
            {HERO_TRUST.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </Stage>

      <Stage
        progress={progress}
        start={SECTIONS.configurator.start}
        end={SECTIONS.configurator.end}
        align="left"
        className="journey-stage--config"
      >
        <p className="journey-eyebrow">Конфигуратор</p>
        <h2>Соберите свой короб</h2>
        <ScrollHint />
        <p className="journey-sub">Размеры, картон, печать, тираж — 3D-модель отвечает сразу.</p>
        {children}
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
        <ScrollHint />
        <p className="journey-sub">{PRINT_LEAD}</p>
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
        align="left"
        className="journey-stage--apps"
      >
        <p className="journey-eyebrow">Применение</p>
        <h2>Где применяют нашу упаковку</h2>
        <ScrollHint />
        <p className="journey-sub">Тот же крафт-картон становится защитой для самого важного.</p>
        <ul className="journey-app-list">
          {APPLICATIONS.map((app) => (
            <li key={app.id}>{app.label}</li>
          ))}
        </ul>
        <a className="journey-cta" href="contacts.html#order">
          Оставить заявку
        </a>
      </Stage>

      <Stage
        progress={progress}
        start={SECTIONS.evolution.start}
        end={SECTIONS.evolution.end}
        align="left"
        className="journey-stage--evo"
      >
        <p className="journey-eyebrow">Эволюция короба</p>
        <h2>{BOX_TYPES[evoIndex].label}</h2>
        <ScrollHint />
        <p className="journey-sub journey-sub--evo" key={`${BOX_TYPES[evoIndex].id}-desc`}>
          {BOX_TYPES[evoIndex].desc}
        </p>
        <a
          className="journey-cta"
          href="contacts.html#order"
          key={`${BOX_TYPES[evoIndex].id}-cta`}
        >
          Оставить заявку
        </a>
      </Stage>

      <Stage
        progress={progress}
        start={SECTIONS.finale.start}
        end={SECTIONS.finale.end}
        align="center"
        className="journey-stage--finale"
        holdEnd
      >
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
