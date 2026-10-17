import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { InstagramLogo, ShoppingCart, WhatsappLogo } from '@phosphor-icons/react'
import Cart, { AddToCart } from './Cart.jsx'
import { useCart } from './CartContext.jsx'
import { useMagnetic } from './useMagnetic.js'
import { wa, MAPS, INSTA, HOURS, HOURS_TABLE, ITEMS } from './data.js'

const PEDIDO = wa('Olá! Quero fazer um pedido.')

function aberto(now = new Date()) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Manaus', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now)
  const g = (t) => p.find((x) => x.type === t).value
  const dia = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[g('weekday')]
  const min = (+g('hour') % 24) * 60 + +g('minute')
  const h = HOURS[dia]
  if (!h) return false
  const f = (s) => { const [a, b] = s.split(':'); return +a * 60 + +b }
  return min >= f(h[0]) && min < f(h[1])
}

// Botão com efeito magnético (só mouse com hover real; sem efeito em toque, teclado ou movimento reduzido)
function MagneticButton({ children, ...rest }) {
  const outer = useRef(null)
  const inner = useRef(null)
  useMagnetic(outer, inner)
  return <a ref={outer} className="btn" {...rest}><span ref={inner} className="mag-in">{children}</span></a>
}

function CartButton() {
  const { count, setOpen } = useCart()
  return (
    <button type="button" className="cart-btn" onClick={() => setOpen(true)}
      aria-label={`Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}>
      <ShoppingCart size={26} weight="bold" aria-hidden="true" />
      {count > 0 && <span className="badge" aria-hidden="true">{count}</span>}
    </button>
  )
}

function Status() {
  const [on, setOn] = useState(aberto)
  useEffect(() => {
    const id = setInterval(() => setOn(aberto()), 60000)
    return () => clearInterval(id)
  }, [])
  return (
    <p className={'pill ' + (on ? 'open' : 'shut')} role="status">
      <span className="dot" aria-hidden="true" />{on ? 'Aberto agora' : 'Fechado agora'}
    </p>
  )
}

// AJUSTES DO SMOOTH SCROLL: lerp menor = mais deslizante (0.08 a 0.14 funciona bem).
// Toque (celular) continua nativo por padrão no Lenis. Desligado com movimento reduzido.
const LENIS = { lerp: 0.1, wheelMultiplier: 1, autoRaf: true }

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis(LENIS)
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      const el = a && a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'))
      if (el) { e.preventDefault(); lenis.scrollTo(el) }
    }
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('click', onClick); lenis.destroy() }
  }, [])
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function App() {
  const hero = useRef(null)
  const [bar, setBar] = useState(false)
  useSmoothScroll()
  useReveal()
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting))
    io.observe(hero.current)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <header className="top">
        <a href="#topo" aria-label="Jack's Burguer, voltar ao início">
          <img src="/img/logo-jacks.png" width="56" height="56" alt="Jack's Burguer" />
        </a>
        <div className="top-r"><Status /><CartButton /></div>
      </header>

      <main id="topo">
        <section className="hero" ref={hero}>
          <div>
            <h1>Carne artesanal no pão brioche. <span>Peça pelo WhatsApp.</span></h1>
            <p className="from">X-Burguer a partir de R$&nbsp;16,00</p>
            <p className="svc">No local, retirada e delivery.</p>
            <div className="cta">
              <MagneticButton href={PEDIDO} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={22} weight="fill" aria-hidden="true" />Pedir Agora</MagneticButton>
              <a className="btn ghost" href="#cardapio">Ver Cardápio</a>
            </div>
          </div>
          <img className="hero-img" src="/img/hero-1000.webp" srcSet="/img/hero-560.webp 560w, /img/hero-1000.webp 1000w"
            sizes="(min-width: 900px) 46vw, 100vw" width="1000" height="1000" fetchpriority="high"
            alt="Hambúrguer artesanal com alface e tomate ao lado de uma Coca-Cola de 350 ml, com a placa do Jack's ao fundo" />
        </section>

        <section id="cardapio" className="wrap menu" aria-labelledby="t-card">
          <h2 id="t-card">Cardápio</h2>
          <ul className="list">
            {ITEMS.map((i) => (
              <li className="reveal" key={i.id}><div className="row">
                <img src={`/img/${i.id}.webp`} width="640" height="640" loading="lazy" alt={`Hambúrguer ${i.name}`} />
                <div className="info"><h3 className="name">{i.name}</h3><p>{i.desc}</p></div>
                <div className="buy">
                  <span className="price">R$&nbsp;{i.price}</span>
                  <AddToCart item={i} />
                </div>
              </div></li>
            ))}
          </ul>
        </section>

        <section id="onde" className="wrap where reveal" aria-labelledby="t-onde">
          <h2 id="t-onde">Onde e quando</h2>
          <div className="cols">
            <div>
              <p className="addr">Rua Tapauá, 19<br />Centro, Iranduba, AM<br />69405-000</p>
              <p className="svc">No local, retirada ou delivery: peça pelo WhatsApp e combine.</p>
              <a className="btn ghost" href={MAPS} target="_blank" rel="noopener noreferrer">Abrir no mapa</a>
            </div>
            <dl className="hrs">
              {HOURS_TABLE.map(([d, h]) => <div key={d}><dt>{d}</dt><dd>{h}</dd></div>)}
            </dl>
          </div>
        </section>
      </main>

      <footer className="wrap foot">
        <img src="/img/logo-jacks.png" width="56" height="56" alt="" />
        <nav aria-label="Contato">
          <a href={INSTA} target="_blank" rel="noopener noreferrer"><InstagramLogo size={24} weight="fill" aria-hidden="true" />Instagram @jacksburgueriranduba</a>
          <a href={PEDIDO} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={24} weight="fill" aria-hidden="true" />WhatsApp (92) 99121-5165</a>
        </nav>
        <details className="priv">
          <summary>Política de privacidade</summary>
          <p>Este site não tem formulários, não usa cookies e não coleta dados pessoais. Os botões de pedido abrem o WhatsApp e o link do Instagram abre a rede social; a partir daí valem as políticas deles. O provedor de hospedagem pode registrar dados técnicos de acesso, como o endereço IP. Dúvidas: fale com a gente pelo WhatsApp.</p>
        </details>
        <p className="copy">© {new Date().getFullYear()} Jack's Burguer. Rua Tapauá, 19, Iranduba, AM.</p>
      </footer>

      <Cart />
      <div className={'bar' + (bar ? ' on' : '')}>
        <a className="btn" href={PEDIDO} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={22} weight="fill" aria-hidden="true" />Pedir Agora</a>
      </div>
    </>
  )
}
