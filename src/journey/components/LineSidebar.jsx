import { useRef, useState, useCallback, useEffect } from 'react'
import './LineSidebar.css'

const FALLOFF_CURVES = {
  linear: (p) => p,
  smooth: (p) => p * p * (3 - 2 * p),
  sharp: (p) => p * p * p,
}

const LineSidebar = ({
  items,
  accentColor = '#ff5a1f',
  textColor = '#c4c4c4',
  markerColor = '#6c6c6c',
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = 'smooth',
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 1.1,
  smoothing = 100,
  orientation = 'vertical',
  defaultActive = null,
  active = null,
  onItemClick,
  className = '',
}) => {
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const itemRefs = useRef([])
  const targetsRef = useRef([])
  const currentRef = useRef([])
  const rafRef = useRef(null)
  const lastRef = useRef(0)
  const activeRef = useRef(defaultActive)
  const smoothingRef = useRef(smoothing)
  const propsRef = useRef({ falloff, proximityRadius, orientation })
  const hotRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(defaultActive)

  const resolvedActive = active != null ? active : activeIndex
  const isHorizontal = orientation === 'horizontal'
  activeRef.current = resolvedActive
  smoothingRef.current = smoothing
  propsRef.current = { falloff, proximityRadius, orientation }

  useEffect(() => {
    if (active != null) setActiveIndex(active)
  }, [active])

  useEffect(() => {
    if (!isHorizontal || resolvedActive == null) return
    const el = itemRefs.current[resolvedActive]
    if (!el) return
    el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [resolvedActive, isHorizontal])

  const runFrame = useCallback((now) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05)
    lastRef.current = now
    const tau = Math.max(smoothingRef.current, 1) / 1000
    const k = 1 - Math.exp(-dt / tau)

    let moving = false
    const nodes = itemRefs.current
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i]
      if (!el) continue
      const target = Math.max(targetsRef.current[i] || 0, activeRef.current === i ? 1 : 0)
      const cur = currentRef.current[i] || 0
      const next = cur + (target - cur) * k
      const settled = Math.abs(target - next) < 0.0015
      const value = settled ? target : next
      currentRef.current[i] = value
      el.style.setProperty('--effect', String(value))
      if (!settled) moving = true
    }

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(runFrame)
  }, [runFrame])

  const applyProximity = useCallback(
    (clientX, clientY) => {
      const root = rootRef.current
      const list = listRef.current
      if (!root || !list) return

      const rootRect = root.getBoundingClientRect()
      const { falloff: curve, proximityRadius: radius, orientation: axis } = propsRef.current
      const horizontal = axis === 'horizontal'
      const padX = horizontal ? radius + 24 : 80
      const padY = horizontal ? 48 : radius + 24
      const inside =
        clientX >= rootRect.left - padX &&
        clientX <= rootRect.right + padX &&
        clientY >= rootRect.top - padY &&
        clientY <= rootRect.bottom + padY

      const nodes = itemRefs.current
      if (!inside) {
        if (!hotRef.current) return
        hotRef.current = false
        for (let i = 0; i < nodes.length; i++) targetsRef.current[i] = 0
        startLoop()
        return
      }

      hotRef.current = true
      const listRect = list.getBoundingClientRect()
      const pointer = horizontal ? clientX - listRect.left : clientY - listRect.top
      const ease = FALLOFF_CURVES[curve]
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i]
        if (!el) continue
        const center = horizontal
          ? el.offsetLeft + el.offsetWidth / 2
          : el.offsetTop + el.offsetHeight / 2
        const distance = Math.abs(pointer - center)
        targetsRef.current[i] = ease(Math.max(0, 1 - distance / radius))
      }
      startLoop()
    },
    [startLoop],
  )

  useEffect(() => {
    const onMove = (e) => applyProximity(e.clientX, e.clientY)
    window.addEventListener('pointermove', onMove, { capture: true, passive: true })
    return () => window.removeEventListener('pointermove', onMove, { capture: true })
  }, [applyProximity])

  const handleClick = useCallback(
    (index, label) => {
      setActiveIndex(index)
      onItemClick?.(index, label)
    },
    [onItemClick],
  )

  useEffect(() => {
    startLoop()
  }, [resolvedActive, items.length, startLoop])

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  return (
    <nav
      ref={rootRef}
      className={[
        'line-sidebar',
        showMarker ? 'line-sidebar--markers' : '',
        scaleTick ? 'line-sidebar--scale-tick' : '',
        isHorizontal ? 'line-sidebar--horizontal' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${smoothing}ms`,
      }}
      aria-label="Этапы истории"
    >
      <ul ref={listRef} className="line-sidebar__list">
        {items.map((label, index) => (
          <li
            key={`${label}-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            className="line-sidebar__item"
            aria-current={resolvedActive === index ? 'true' : undefined}
            onClick={() => handleClick(index, label)}
          >
            {showMarker && <span className="line-sidebar__marker" aria-hidden="true" />}
            <span className="line-sidebar__label">
              {showIndex && (
                <span className="line-sidebar__index">{String(index + 1).padStart(2, '0')}</span>
              )}
              <span className="line-sidebar__text">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default LineSidebar
