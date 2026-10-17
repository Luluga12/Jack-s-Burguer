export const WHATS = '5592991215165'
export const wa = (t) => `https://wa.me/${WHATS}?text=${encodeURIComponent(t)}`
export const MAPS = 'https://maps.app.goo.gl/9rKRjHeAYMSdHHEN7?g_st=aw'
export const INSTA = 'https://instagram.com/jacksburgueriranduba'

// Horário de Manaus. Chave = dia da semana (0 = domingo). Dia ausente = fechado.
export const HOURS = { 1: ['18:15', '23:00'], 2: ['18:15', '23:00'], 5: ['18:30', '23:00'], 6: ['18:30', '23:00'] }
export const HOURS_TABLE = [
  ['Domingo', 'Fechado'], ['Segunda e terça', '18:15 às 23:00'],
  ['Quarta e quinta', 'Fechado'], ['Sexta e sábado', '18:30 às 23:00'],
]

// Do mais barato ao mais caro. As fotos ficam em public/img/<id>.webp
export const ITEMS = [
  { id: 'x-burguer', name: 'X-Burguer', price: '16,00', desc: 'Pão brioche, carne artesanal, alface, queijo mussarela, molho barbecue e molho especial.' },
  { id: 'x-artesanal', name: 'X-Artesanal', price: '19,00', desc: 'Pão brioche, carne artesanal, alface, tomate, ovo, queijo mussarela, molho barbecue e molho especial.' },
  { id: 'x-tradicional-bacon', name: 'X-Tradicional Bacon', price: '23,00', desc: 'Pão brioche, carne artesanal, alface, tomate, queijo cheddar, molho cheddar, bacon, molho barbecue, molho especial e creme cheddar.' },
  { id: 'jacks-caboquinho', name: 'Jacks Caboquinho', price: '26,00', desc: 'Pão brioche, carne artesanal, queijo coalho, queijo mussarela, banana frita, mel e molho especial.' },
  { id: 'duplo-cheddar', name: 'Duplo Cheddar', price: '30,00', desc: 'Pão brioche, 2 blends de carne artesanal, duplo queijo cheddar, duplo creme cheddar, molho barbecue e molho especial.' },
  { id: 'duplo-cheddar-bacon', name: 'Duplo Cheddar Bacon', price: '33,00', desc: 'Pão brioche, 2 blends de carne artesanal, duplo queijo cheddar, duplo bacon, duplo creme cheddar, molho barbecue e molho especial.' },
]

// TAXA DE ENTREGA, em centavos (400 = R$ 4,00). Se um dia ficar null (não definida):
// o pedido mostra "a combinar" e a taxa não entra no total. O número do WhatsApp é o WHATS, no topo deste arquivo.
export const DELIVERY_FEE_CENTS = 400 // taxa fixa de entrega em Iranduba: R$ 4,00
