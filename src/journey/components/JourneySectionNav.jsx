import { useEffect, useState } from 'react'
import LineSidebar from './LineSidebar'
import { JOURNEY_NAV, journeyNavIndex } from '../data/story'

const LABELS = JOURNEY_NAV.map((item) => item.label)

/** Same breakpoints as tablet/mobile journey layout. */
const COMPACT_MQ = '(max-width: 1100px), ((max-width: 1366px) and (orientation: portrait))'
const PHONE_MQ = '(max-width: 960px)'

function useNavLayout() {
  const [layout, setLayout] = useState(() => {
    if (typeof window === 'undefined') return 'desktop'
    if (!window.matchMedia(COMPACT_MQ).matches) return 'desktop'
    return window.matchMedia(PHONE_MQ).matches ? 'phone' : 'tablet'
  })

  useEffect(() => {
    const compactMq = window.matchMedia(COMPACT_MQ)
    const phoneMq = window.matchMedia(PHONE_MQ)
    const update = () => {
      if (!compactMq.matches) {
        setLayout('desktop')
        return
      }
      setLayout(phoneMq.matches ? 'phone' : 'tablet')
    }
    update()
    compactMq.addEventListener('change', update)
    phoneMq.addEventListener('change', update)
    return () => {
      compactMq.removeEventListener('change', update)
      phoneMq.removeEventListener('change', update)
    }
  }, [])

  return layout
}

const BAR_PROPS = {
  phone: {
    proximityRadius: 52,
    maxShift: 3,
    markerLength: 28,
    markerGap: 3,
    tickScale: 0.3,
    itemGap: 10,
    fontSize: 0.6,
  },
  tablet: {
    proximityRadius: 88,
    maxShift: 6,
    markerLength: 52,
    markerGap: 6,
    tickScale: 0.42,
    itemGap: 22,
    fontSize: 1.18,
  },
}

export function JourneySectionNav({ progress, onJump }) {
  const active = journeyNavIndex(progress)
  const layout = useNavLayout()
  const isBar = layout !== 'desktop'
  const bar = isBar ? BAR_PROPS[layout] : null

  return (
    <aside
      className={`journey-section-nav${isBar ? ` journey-section-nav--bar journey-section-nav--${layout}` : ''}`}
    >
      <LineSidebar
        className={isBar ? '' : 'line-sidebar--right'}
        orientation={isBar ? 'horizontal' : 'vertical'}
        items={LABELS}
        accentColor="#ff5a1f"
        textColor="#9e9890"
        markerColor="#6a6560"
        showIndex
        showMarker
        proximityRadius={bar?.proximityRadius ?? 120}
        maxShift={bar?.maxShift ?? 32}
        falloff="smooth"
        markerLength={bar?.markerLength ?? 56}
        markerGap={bar?.markerGap ?? 2}
        tickScale={bar?.tickScale ?? 0.5}
        scaleTick
        itemGap={bar?.itemGap ?? 16}
        fontSize={bar?.fontSize ?? 1.05}
        smoothing={70}
        active={active}
        onItemClick={(index) => onJump(JOURNEY_NAV[index].progress)}
      />
    </aside>
  )
}
