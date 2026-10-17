import { ITEMS, wa, DELIVERY_FEE_CENTS } from './data.js'

export const MAX_QTY = 99
export const byId = (id) => ITEMS.find((i) => i.id === id)
// Preços em centavos (inteiros), para não ter erro de arredondamento. Fonte única: ITEMS em data.js.
export const priceCents = (it) => { const [r, c = '0'] = String(it.price).split(','); return +r.replace(/\./g, '') * 100 + +c.padEnd(2, '0').slice(0, 2) }
export const brl = (c) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ')
export const clampQty = (n) => Math.max(0, Math.min(MAX_QTY, Number.isFinite(+n) ? Math.trunc(+n) : 0))
export const lineTotal = (it, qty) => priceCents(it) * clampQty(qty)
export const subtotal = (lines) => lines.reduce((s, l) => s + lineTotal(l.item, l.qty), 0)
export const feeIsPending = (modo) => modo === 'entrega' && DELIVERY_FEE_CENTS == null
export const feeFor = (modo) => (modo === 'entrega' && DELIVERY_FEE_CENTS != null ? DELIVERY_FEE_CENTS : 0)
export const total = (lines, modo) => subtotal(lines) + feeFor(modo)

// Estado do carrinho: { [idDoLanche]: quantidade }
export function sanitize(raw) {
  const out = {}
  if (raw && typeof raw === 'object') for (const [id, q] of Object.entries(raw)) { const n = clampQty(q); if (byId(id) && n > 0) out[id] = n }
  return out
}
export function cartReducer(s, a) {
  if (a.type === 'clear') return {}
  const n = { ...s }
  const q = a.type === 'add' ? clampQty((s[a.id] || 0) + clampQty(a.qty)) : clampQty(a.qty)
  if (!byId(a.id) || a.type === 'remove' || q <= 0) delete n[a.id]; else n[a.id] = q
  return n
}

export const PAGAMENTOS = ['Pix', 'Débito', 'Dinheiro', 'Crédito']

// Data e hora de Manaus (onde fica a hamburgueria), não as do aparelho do cliente.
export function stamp(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Manaus', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).map((x) => [x.type, x.value]))
  return { date: `${p.day}/${p.month}/${p.year}`, time: `${p.hour === '24' ? '00' : p.hour}:${p.minute}` }
}

export function validate(f) {
  const e = {}
  if (f.nome.trim().length < 2) e.nome = 'Informe seu nome.'
  if (f.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Informe um telefone com DDD.'
  if (f.modo === 'entrega') {
    if (f.endereco.trim().length < 5) e.endereco = 'Informe rua e número.'
    if (f.bairro.trim().length < 2) e.bairro = 'Informe o bairro.'
    if (f.referencia.trim().length < 3) e.referencia = 'Informe um ponto de referência.'
  }
  if (!PAGAMENTOS.includes(f.pagamento)) e.pagamento = 'Escolha a forma de pagamento.'
  return e
}

// Mensagem no estilo do cardápio digital antigo. O valor ao lado de cada produto é o subtotal da linha.
export function buildMessage(lines, f, when = new Date()) {
  const { date, time } = stamp(when)
  const entrega = f.modo === 'entrega'
  const out = ['👋 *Pedido pelo site*', `🗓️ ${date}  ⏰ ${time}`, '', `*Tipo de serviço: ${entrega ? 'Delivery' : 'Retirada no local'}*`, '', `*Nome:* ${f.nome.trim()}`, `*Telefone:* ${f.telefone.trim()}`]
  if (entrega) out.push(`*Endereço:* ${f.endereco.trim()} - ${f.bairro.trim()}, Iranduba - AM`, `*Referência:* ${f.referencia.trim()}`)
  out.push('', '📝 *Produtos*')
  lines.forEach(({ item, qty }) => out.push(`X${qty} 🍔 ${item.name.toUpperCase()}  ${brl(lineTotal(item, qty))}`))
  out.push('', `Subtotal: ${brl(subtotal(lines))}`)
  if (entrega) out.push(`Delivery: ${feeIsPending(f.modo) ? 'a combinar' : brl(feeFor(f.modo))}`)
  out.push(`*Total${feeIsPending(f.modo) ? ' (sem a taxa de entrega)' : ''}: ${brl(total(lines, f.modo))}*`, '', `*💲 Pagamento: ${f.pagamento}*`)
  if (f.obs.trim()) out.push(`*Observações:* ${f.obs.trim()}`)
  return out.join('\n')
}
export const orderLink = (lines, f, when) => wa(buildMessage(lines, f, when))
