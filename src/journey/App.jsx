import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { ConfiguratorPanel } from './components/ConfiguratorPanel'
import { JourneySectionNav } from './components/JourneySectionNav'
import { Overlays } from './components/Overlays'
import { Scene } from './components/Scene'
import { SECTIONS } from './data/story'
import { useScrollStory } from './hooks/useScrollStory'

const SCROLL_HEIGHT = '900vh'

function useNarrowViewport(query = '(max-width: 719px)') {
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setNarrow(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])
  return narrow
}

export default function App() {
  const scrollerRef = useRef(null)
  const { progress, progressRef, scrollToProgress } = useScrollStory(scrollerRef)
  const narrow = useNarrowViewport()
  const [menuOpen, setMenuOpen] = useState(false)
  const atStart = progress < SECTIONS.configurator.start
  const inConfigurator =
    progress >= SECTIONS.configurator.start && progress < SECTIONS.configurator.end

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div
      className={`journey${narrow ? ' journey--narrow' : ''}${atStart ? ' journey--start' : ''}${
        inConfigurator ? ' journey--config' : ''
      }${menuOpen ? ' journey--menu-open' : ''}`}
    >
      <header className={`journey-nav${menuOpen ? ' is-menu-open' : ''}`}>
        <a className="journey-nav__brand" href="journey.html" aria-label="БАЛТКАРТОН — на главную">
          <img
            src="/brand/logo-horizontal-dark.png"
            alt="БАЛТКАРТОН — производство гофрокартона"
            width="420"
            height="96"
          />
        </a>
        <button
          type="button"
          className={`journey-nav__burger${menuOpen ? ' is-open' : ''}`}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="journey-nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          id="journey-nav-menu"
          className={menuOpen ? 'is-open' : undefined}
          aria-label="Навигация Journey"
          onClick={(e) => {
            if (e.target.closest('a')) setMenuOpen(false)
          }}
        >
          <a className="is-active" href="journey.html">
            Главная
          </a>
          <a href="catalog.html">Каталог</a>
          <a href="print.html">Печать логотипов</a>
          <a href="delivery.html">Доставка и оплата</a>
          <a href="contacts.html">Контакты</a>
          <a
            className="journey-nav__tg"
            href="https://t.me/Dmitry_an812"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram @Dmitry_an812"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9.78 18.65l.28-4.23 7.68-6.93c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 14.5l-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
          </a>
          <a className="journey-nav__cta" href="contacts.html#order">
            Заявка
          </a>
        </nav>
      </header>

      <JourneySectionNav progress={progress} onJump={scrollToProgress} />

      <div className="journey-canvas" aria-hidden="true">
        <Canvas
          shadows
          dpr={narrow ? [1, 1.35] : [1, 1.75]}
          camera={{
            position: [0.85, 1.55, narrow ? 3.7 : 3.2],
            fov: narrow ? 42 : 38,
            near: 0.1,
            far: 40,
          }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <Scene progress={progressRef} />
        </Canvas>
        <div className="journey-canvas__veil" />
      </div>

      <div className="journey-scroll" ref={scrollerRef}>
        <div className="journey-scroll__track" data-journey-content style={{ height: SCROLL_HEIGHT }}>
          <div className="journey-scroll__sticky">
            <Overlays progress={progress}>
              <ConfiguratorPanel />
            </Overlays>
            <div className="journey-progress" aria-hidden="true">
              <div className="journey-progress__bar" style={{ transform: `scaleX(${progress})` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
