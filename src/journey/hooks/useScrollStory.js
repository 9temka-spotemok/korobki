import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis + GSAP ScrollTrigger master progress (0–1) for the journey scroller.
 */
export function useScrollStory(scrollerRef) {
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const lenisRef = useRef(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return undefined

    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector('[data-journey-content]'),
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.35,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const ticker = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      },
      pinType: scroller.style.transform ? 'transform' : 'fixed',
    })

    const trigger = ScrollTrigger.create({
      scroller,
      trigger: scroller.querySelector('[data-journey-content]'),
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.1,
      onUpdate: (self) => {
        progressRef.current = self.progress
        setProgress(self.progress)
      },
    })

    const onResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      trigger.kill()
      gsap.ticker.remove(ticker)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((t) => t.kill())
      lenisRef.current = null
    }
  }, [scrollerRef])

  const scrollToProgress = (targetProgress, { duration = 1.25 } = {}) => {
    const scroller = scrollerRef.current
    const lenis = lenisRef.current
    if (!scroller || !lenis) return
    const content = scroller.querySelector('[data-journey-content]')
    if (!content) return
    const maxScroll = Math.max(0, content.offsetHeight - scroller.clientHeight)
    const p = Math.min(1, Math.max(0, targetProgress))
    lenis.scrollTo(p * maxScroll, { duration })
  }

  return { progress, progressRef, lenisRef, scrollToProgress }
}
