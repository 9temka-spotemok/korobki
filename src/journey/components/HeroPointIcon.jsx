/** Compact stroke icons for Journey hero points (seal / box / stack / truck). */
export function HeroPointIcon({ name }) {
  if (name === 'seal') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M24 8.5 L27.2 12.2 L31.8 10.6 L32.6 15.4 L37.4 16.3 L35.8 20.8 L39.5 24 L35.8 27.2 L37.4 31.7 L32.6 32.6 L31.8 37.4 L27.2 35.8 L24 39.5 L20.8 35.8 L16.3 37.4 L15.4 32.6 L10.6 31.8 L12.2 27.2 L8.5 24 L12.2 20.8 L10.6 16.3 L15.4 15.4 L16.3 10.6 L20.8 12.2 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M18.2 24.2 22.4 28.4 30.2 20.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (name === 'box') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M9 18.5 24 10l15 8.5V31L24 39.5 9 31V18.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 18.5 24 27l15-8.5M24 27v12.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (name === 'stack') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 9.5 36.5 16.5 24 23.5 11.5 16.5 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 16.5 36.5 23.5 24 30.5 11.5 23.5 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 23.5 36.5 30.5 24 37.5 11.5 30.5 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  }
  if (name === 'truck') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M4 20h3.2M4 24.5h4.2M4 29h2.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 18.5h16.5V31H10V18.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M26.5 22H34l5.5 5.8V31H26.5V22Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16.2" cy="34.2" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="33.2" cy="34.2" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M19.4 34.2h10.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  throw new Error(`Неизвестная иконка hero: ${name}`)
}
