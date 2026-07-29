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
    markerLength: 14,
    markerGap: 4,
    tickScale: 0.3,
    itemGap: 12,
    fontSize: 0.72,
  },
  tablet: {
    proximityRadius: 88,
    maxShift: 6,
    markerLength: 18,
    markerGap: 6,
    tickScale: 0.42,
    itemGap: 24,
    fontSize: 1.28,
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
        textColor="#6a5f54"
        markerColor="#a89888"
        showIndex={false}
        showMarker
        proximityRadius={bar?.proximityRadius ?? 120}
        maxShift={bar?.maxShift ?? 18}
        falloff="smooth"
        markerLength={bar?.markerLength ?? 22}
        markerGap={bar?.markerGap ?? 8}
        tickScale={bar?.tickScale ?? 0.5}
        scaleTick={false}
        itemGap={bar?.itemGap ?? 22}
        fontSize={bar?.fontSize ?? 1.28}
        smoothing={70}
        active={active}
        onItemClick={(index) => onJump(JOURNEY_NAV[index].progress)}
      />
    </aside>
  )
}
