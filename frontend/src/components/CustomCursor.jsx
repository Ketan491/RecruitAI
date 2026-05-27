// CustomCursor.jsx — Fixed: ring ref shadowing bug, proper position tracking
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef    = useRef(null)
  const ringRef   = useRef(null)
  // Separate refs for mouse position and ring trailing position
  const mousePos  = useRef({ x: -200, y: -200 })
  const ringPos   = useRef({ x: -200, y: -200 })
  const rafId     = useRef(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Track raw mouse position
    const onMove = e => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    // Expand ring on interactive elements
    const onEnter = () => ring.classList.add('hovering')
    const onLeave = () => ring.classList.remove('hovering')

    // Animate: dot snaps, ring lags behind with lerp
    const animate = () => {
      // Lerp ring toward mouse
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12

      // Apply positions (translate handles centering via CSS)
      dot.style.left  = `${mousePos.current.x}px`
      dot.style.top   = `${mousePos.current.y}px`
      ring.style.left = `${ringPos.current.x}px`
      ring.style.top  = `${ringPos.current.y}px`

      rafId.current = requestAnimationFrame(animate)
    }

    // Attach hover listeners to interactive elements
    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    window.addEventListener('mousemove', onMove)
    addHoverListeners()
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId.current)
      document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <>
      <div id="cursor-dot"  ref={dotRef}  />
      <div id="cursor-ring" ref={ringRef} />
    </>
  )
}
