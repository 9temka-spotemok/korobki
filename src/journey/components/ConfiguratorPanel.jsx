import { useEffect, useState } from 'react'
import { SIZE_BOUNDS, configState, setConfig, subscribeConfig } from '../state/configStore'
import { BrandSelect } from './BrandSelect'

const BOARD_OPTIONS = [
  { value: 'kraft', label: 'Бурый / kraft' },
  { value: 'white', label: 'Белый' },
]

const PRINT_OPTIONS = [
  { value: '1', label: '1 цвет' },
  { value: '2', label: '2 цвета' },
  { value: '3', label: '3 цвета' },
  { value: 'custom', label: 'Свой макет' },
]

export function ConfiguratorPanel() {
  const [cfg, setCfg] = useState({ ...configState })

  useEffect(() => subscribeConfig((s) => setCfg({ ...s })), [])

  const update = (partial) => setConfig(partial)
  const orderHref = `contacts.html#order`

  return (
    <div className="journey-config">
      <p className="journey-config__summary">
        {cfg.lengthMm} × {cfg.widthMm} × {cfg.heightMm} мм
      </p>

      <div className="journey-config__dims">
        <label>
          <span>Длина · {cfg.lengthMm} мм</span>
          <input
            type="range"
            min={SIZE_BOUNDS.length.min}
            max={SIZE_BOUNDS.length.max}
            step="10"
            value={cfg.lengthMm}
            onChange={(e) => update({ lengthMm: Number(e.target.value) })}
          />
        </label>
        <label>
          <span>Ширина · {cfg.widthMm} мм</span>
          <input
            type="range"
            min={SIZE_BOUNDS.width.min}
            max={SIZE_BOUNDS.width.max}
            step="10"
            value={cfg.widthMm}
            onChange={(e) => update({ widthMm: Number(e.target.value) })}
          />
        </label>
        <label>
          <span>Высота · {cfg.heightMm} мм</span>
          <input
            type="range"
            min={SIZE_BOUNDS.height.min}
            max={SIZE_BOUNDS.height.max}
            step="10"
            value={cfg.heightMm}
            onChange={(e) => update({ heightMm: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="journey-config__opts">
        <label>
          <span>Тип картона</span>
          <BrandSelect
            label="Тип картона"
            value={cfg.board}
            options={BOARD_OPTIONS}
            onChange={(board) => update({ board })}
          />
        </label>
        <label>
          <span>Печать</span>
          <BrandSelect
            label="Печать"
            value={cfg.printing}
            options={PRINT_OPTIONS}
            onChange={(printing) => update({ printing })}
          />
        </label>
      </div>

      <label className="journey-config__qty">
        <span>Тираж · {cfg.quantity}</span>
        <input
          type="range"
          min="100"
          max="20000"
          step="100"
          value={cfg.quantity}
          onChange={(e) => update({ quantity: Number(e.target.value) })}
        />
      </label>

      <a className="journey-config__cta" href={orderHref}>
        Оставить заявку
      </a>
    </div>
  )
}
