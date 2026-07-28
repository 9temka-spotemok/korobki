import { useEffect, useId, useRef, useState } from 'react'

/**
 * Dark-theme brand dropdown for Journey configurator
 * (black trigger / white list / grey active row).
 */
export function BrandSelect({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()
  const selected = options.find((o) => o.value === value) || options[0]

  useEffect(() => {
    if (!open) return undefined

    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const need = Math.min(220, options.length * 40 + 8)
    setDropUp(spaceBelow < need && rect.top > spaceBelow)
  }, [open, options.length])

  const pick = (next) => {
    if (next !== value) onChange(next)
    setOpen(false)
  }

  return (
    <div className={`j-select${open ? ' is-open' : ''}${dropUp ? ' is-drop-up' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="j-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="j-select__value">{selected?.label}</span>
        <span className="j-select__caret" aria-hidden="true" />
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          className="j-select__list"
          role="listbox"
          aria-label={label}
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  className={`j-select__option${active ? ' is-active' : ''}`}
                  aria-selected={active}
                  onClick={() => pick(opt.value)}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
