import { useEffect } from 'react'

// PARÂMETROS AJUSTÁVEIS DO BOTÃO MAGNÉTICO
export const MAGNETIC = {
  max: 8,          // deslocamento máximo por eixo, em px
  radius: 72,      // a partir de quantos px da borda do botão o efeito começa
  force: 0.3,      // fração da distância até o centro que vira deslocamento
  stiffness: 220,  // rigidez da mola: maior = volta mais rápido
  damping: 1,      // 1 = sem oscilar; abaixo de 1 balança um pouco
}

const clamp = (v, m) => Math.max(-m, Math.min(m, v))

// Move só o conteúdo interno (innerRef). O botão (outerRef) fica parado, então a área de clique não foge.
export function useMagnetic(outerRef, innerRef) {
  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const { max, radius, force, stiffness, damping } = MAGNETIC
    const c = 2 * Math.sqrt(stiffness) * damping
    let raf = 0, last = 0, tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      vx += (-stiffness * (x - tx) - c * vx) * dt; x += vx * dt
      vy += (-stiffness * (y - ty) - c * vy) * dt; y += vy * dt
      const done = Math.abs(x - tx) < 0.02 && Math.abs(y - ty) < 0.02 && Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02
      if (done) { x = tx; y = ty; vx = vy = 0; raf = 0 }
      inner.style.transform = x || y ? `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` : ''
      if (!done) raf = requestAnimationFrame(step)
    }
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step) } }
    const aim = (nx, ny) => { if (nx !== tx || ny !== ty) { tx = nx; ty = ny; kick() } }

    const onMove = (e) => {
      if (e.pointerType !== 'mouse' || !fine.matches || calm.matches) return aim(0, 0)
      const r = outer.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const out = Math.hypot(Math.max(Math.abs(dx) - r.width / 2, 0), Math.max(Math.abs(dy) - r.height / 2, 0))
      if (out >= radius) return aim(0, 0)
      const k = 1 - out / radius
      aim(clamp(dx * force, max) * k, clamp(dy * force, max) * k)
    }
    const release = () => aim(0, 0)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', release)
    document.documentElement.addEventListener('pointerleave', release)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', release)
      document.documentElement.removeEventListener('pointerleave', release)
      cancelAnimationFrame(raf)
      inner.style.transform = ''
    }
  }, [outerRef, innerRef])
}
