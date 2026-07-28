import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { ConfiguratorPanel } from './components/ConfiguratorPanel'
import { Overlays } from './components/Overlays'
import { Scene } from './components/Scene'
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
  const { progress, progressRef } = useScrollStory(scrollerRef)
  const narrow = useNarrowViewport()

  return (
    <div className={`journey${narrow ? ' journey--narrow' : ''}`}>
      <header className="journey-nav">
        <a className="journey-nav__brand" href="index.html" aria-label="БАЛТКАРТОН — на главную">
          <img src="/brand/logo-horizontal-light.png" alt="БАЛТКАРТОН" width="160" height="36" />
        </a>
        <nav aria-label="Навигация Journey">
          <a href="catalog.html">Каталог</a>
          <a className="is-active" href="journey.html">
            История
          </a>
          <a className="journey-nav__cta" href="contacts.html#order">
            Заявка
          </a>
        </nav>
      </header>

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
            <p className="journey-hint" style={{ opacity: progress < 0.04 ? 0.7 : 0 }}>
              Листайте вниз
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
