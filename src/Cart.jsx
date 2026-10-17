import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Minus, Plus, Trash, WhatsappLogo, X } from '@phosphor-icons/react'
import { useCart } from './CartContext.jsx'
import { DELIVERY_FEE_CENTS } from './data.js'
import { MAX_QTY, brl, priceCents, lineTotal, subtotal, total, feeFor, feeIsPending, validate, orderLink, PAGAMENTOS } from './cart.js'

function Stepper({ value, onChange, label }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 0} aria-label={`Diminuir ${label}`}>
        <Minus size={18} weight="bold" aria-hidden="true" />
      </button>
      <output>{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={`Aumentar ${label}`}>
        <Plus size={18} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
}

// Seletor + botão de cada lanche do cardápio. Começa em 0 e só adiciona ao carrinho ao clicar em Adicionar.
export function AddToCart({ item }) {
  const { add } = useCart()
  const [q, setQ] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 1600)
    return () => clearTimeout(t)
  }, [done])
  return (
    <div className="addrow">
      <Stepper value={q} onChange={(v) => setQ(Math.max(0, Math.min(MAX_QTY, v)))} label={`quantidade de ${item.name}`} />
      <button type="button" className={'btn line add' + (done ? ' ok' : '')} disabled={q === 0}
        onClick={() => { add(item.id, q); setQ(0); setDone(true) }}>
        {done ? 'Adicionado' : 'Adicionar'}
      </button>
      <span className="sr" role="status">{done ? `${item.name} adicionado ao carrinho` : ''}</span>
    </div>
  )
}

function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="err" id={`${id}-e`}>{error}</p>}
    </div>
  )
}
const inp = (id, error) => ({ id, name: id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-e` : undefined })

const EMPTY = { nome: '', telefone: '', modo: 'entrega', endereco: '', bairro: '', referencia: '', pagamento: '', obs: '' }
const TITLES = { cart: 'Seu pedido', form: 'Seus dados', review: 'Conferir pedido' }

export default function Cart() {
  const { lines, open, setOpen, set, remove, clear } = useCart()
  const ref = useRef(null)
  const [step, setStep] = useState('cart')
  const [f, setF] = useState(EMPTY)
  const [err, setErr] = useState({})
  const [sent, setSent] = useState(false)
  const close = () => setOpen(false)
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const entrega = f.modo === 'entrega'

  useEffect(() => {
    const d = ref.current
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  useEffect(() => { if (!lines.length) setStep('cart') }, [lines.length])
  useEffect(() => { ref.current?.querySelector('.cart-body')?.scrollTo(0, 0); setSent(false) }, [step])

  const review = (e) => {
    e.preventDefault()
    const er = validate(f)
    setErr(er)
    if (Object.keys(er).length) { setTimeout(() => (ref.current.querySelector('input[aria-invalid="true"]') || ref.current.querySelector('input[name="pagamento"]'))?.focus(), 0); return }
    setStep('review')
  }

  return (
    <dialog ref={ref} className="cart" aria-labelledby="t-cart" data-lenis-prevent
      onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && close()}>
      <header className="cart-head">
        {step !== 'cart' && (
          <button type="button" className="icon" aria-label="Voltar" onClick={() => setStep(step === 'review' ? 'form' : 'cart')}>
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
        )}
        <h2 id="t-cart">{TITLES[step]}</h2>
        <button type="button" className="icon" aria-label="Fechar carrinho" onClick={close}><X size={22} aria-hidden="true" /></button>
      </header>

      <div className="cart-body">
        {step === 'cart' && (lines.length === 0 ? (
          <div className="empty">
            <p>Seu carrinho está vazio.</p>
            <p>Escolha seus lanches no cardápio e toque em Adicionar.</p>
            <a className="btn" href="#cardapio" onClick={close}>Ver cardápio</a>
          </div>
        ) : (
          <>
            <ul className="clines">
              {lines.map(({ item, qty }) => (
                <li key={item.id}>
                  <img src={`/img/${item.id}.webp`} width="64" height="64" alt="" />
                  <div>
                    <p className="cname">{item.name}</p>
                    <p className="cmuted">{brl(priceCents(item))} cada</p>
                    <Stepper value={qty} onChange={(v) => set(item.id, v)} label={`quantidade de ${item.name}`} />
                  </div>
                  <div className="cright">
                    <button type="button" className="icon" aria-label={`Remover ${item.name}`} onClick={() => remove(item.id)}>
                      <Trash size={20} aria-hidden="true" />
                    </button>
                    <strong>{brl(lineTotal(item, qty))}</strong>
                  </div>
                </li>
              ))}
            </ul>
            <p className="sum big"><span>Subtotal</span><strong>{brl(subtotal(lines))}</strong></p>
            <div className="cactions">
              <button type="button" className="btn" onClick={() => setStep('form')}>Continuar</button>
              <button type="button" className="btn ghost" onClick={close}>Continuar comprando</button>
            </div>
          </>
        ))}

        {step === 'form' && (
          <form className="cform" onSubmit={review} noValidate>
            <Field id="nome" label="Nome" error={err.nome}>
              <input {...inp('nome', err.nome)} value={f.nome} onChange={upd('nome')} autoComplete="name" />
            </Field>
            <Field id="telefone" label="Telefone ou WhatsApp" error={err.telefone}>
              <input {...inp('telefone', err.telefone)} type="tel" inputMode="tel" autoComplete="tel" placeholder="(92) 99999-9999" value={f.telefone} onChange={upd('telefone')} />
            </Field>
            <fieldset className="modes">
              <legend>Como você quer receber?</legend>
              <label><input type="radio" name="modo" value="entrega" checked={entrega} onChange={upd('modo')} />Entrega</label>
              <label><input type="radio" name="modo" value="retirada" checked={!entrega} onChange={upd('modo')} />Retirada no local</label>
            </fieldset>
            {entrega && (
              <>
                {DELIVERY_FEE_CENTS != null && <p className="note">Entrega em Iranduba, com taxa fixa de {brl(DELIVERY_FEE_CENTS)}.</p>}
                <Field id="endereco" label="Rua e número" error={err.endereco}>
                  <input {...inp('endereco', err.endereco)} autoComplete="street-address" value={f.endereco} onChange={upd('endereco')} />
                </Field>
                <Field id="bairro" label="Bairro" error={err.bairro}>
                  <input {...inp('bairro', err.bairro)} value={f.bairro} onChange={upd('bairro')} />
                </Field>
                <Field id="referencia" label="Ponto de referência" error={err.referencia}>
                  <input {...inp('referencia', err.referencia)} value={f.referencia} onChange={upd('referencia')} />
                </Field>
              </>
            )}
            <fieldset className="modes">
              <legend>Forma de pagamento</legend>
              {PAGAMENTOS.map((p) => (
                <label key={p}>
                  <input type="radio" name="pagamento" value={p} checked={f.pagamento === p} onChange={upd('pagamento')} aria-describedby={err.pagamento ? 'pagamento-e' : undefined} />{p}
                </label>
              ))}
            </fieldset>
            {err.pagamento && <p className="err" id="pagamento-e">{err.pagamento}</p>}
            <Field id="obs" label="Observações (opcional)">
              <textarea id="obs" name="obs" rows="3" value={f.obs} onChange={upd('obs')} />
            </Field>
            <button type="submit" className="btn">Revisar pedido</button>
          </form>
        )}

        {step === 'review' && (
          <div className="review">
            <ul className="rlines">
              {lines.map(({ item, qty }) => <li key={item.id}><span>{qty}x {item.name}</span><span>{brl(lineTotal(item, qty))}</span></li>)}
            </ul>
            <dl className="rinfo">
              <div><dt>Cliente</dt><dd>{f.nome}, {f.telefone}</dd></div>
              <div><dt>Recebimento</dt><dd>{entrega ? 'Entrega' : 'Retirada no local'}</dd></div>
              <div><dt>Pagamento</dt><dd>{f.pagamento}</dd></div>
              {entrega && <div><dt>Endereço</dt><dd>{f.endereco}, {f.bairro}. Referência: {f.referencia}</dd></div>}
              {f.obs.trim() && <div><dt>Observações</dt><dd>{f.obs}</dd></div>}
            </dl>
            <p className="sum"><span>Subtotal</span><span>{brl(subtotal(lines))}</span></p>
            {entrega && <p className="sum"><span>Taxa de entrega</span><span>{feeIsPending(f.modo) ? 'a combinar' : brl(feeFor(f.modo))}</span></p>}
            <p className="sum big"><span>Total{feeIsPending(f.modo) ? ' (sem a taxa)' : ''}</span><strong>{brl(total(lines, f.modo))}</strong></p>
            <a className="btn" href={orderLink(lines, f)} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.currentTarget.href = orderLink(lines, f); setSent(true) }}>
              <WhatsappLogo size={22} weight="fill" aria-hidden="true" />Enviar pelo WhatsApp
            </a>
            <button type="button" className="btn ghost" onClick={() => setStep('form')}>Corrigir dados</button>
            {sent && (
              <p className="note" role="status">
                O WhatsApp abriu com a mensagem pronta. O pedido só vale depois que você tocar em enviar lá.{' '}
                <button type="button" className="link" onClick={() => { clear(); setStep('cart'); close() }}>Limpar carrinho</button>
              </p>
            )}
          </div>
        )}
      </div>
    </dialog>
  )
}
