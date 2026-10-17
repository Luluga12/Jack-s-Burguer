import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { byId, cartReducer, sanitize } from './cart.js'

const KEY = 'jacks:cart:v1'
const Ctx = createContext(null)

function load() {
  try { return sanitize(JSON.parse(localStorage.getItem(KEY) || '{}')) } catch { return {} }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, null, load)
  const [open, setOpen] = useState(false)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* modo privado: segue sem salvar */ } }, [state])
  const value = useMemo(() => {
    const lines = Object.entries(state).map(([id, qty]) => ({ item: byId(id), qty }))
    return {
      lines, open, setOpen,
      count: lines.reduce((s, l) => s + l.qty, 0),
      add: (id, qty) => dispatch({ type: 'add', id, qty }),
      set: (id, qty) => dispatch({ type: 'set', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [state, open])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCart = () => useContext(Ctx)
