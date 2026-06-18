import { CART_ADD_ITEM, CART_REMOVE_ITEM, CART_UPDATE_QTY, CART_CLEAR } from './actions'

const initial = { items: [] }

export default function cartReducer(state = initial, action) {
  switch (action.type) {
    case CART_ADD_ITEM: {
      const p = action.payload
      const cartKey = p.cart_key || String(p.id)
      const exists = state.items.find(i => i.cart_key === cartKey)
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.cart_key === cartKey ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
      }
      return {
        ...state,
        items: [...state.items, {
          cart_key: cartKey,
          product_id: p.id,
          name: p.name,
          unit_price: p.price,
          quantity: 1,
        }]
      }
    }
    case CART_REMOVE_ITEM:
      return { ...state, items: state.items.filter(i => i.cart_key !== action.payload) }
    case CART_UPDATE_QTY: {
      const { cartKey, qty } = action.payload
      if (qty <= 0) return { ...state, items: state.items.filter(i => i.cart_key !== cartKey) }
      return {
        ...state,
        items: state.items.map(i => i.cart_key === cartKey ? { ...i, quantity: qty } : i)
      }
    }
    case CART_CLEAR:
      return initial
    default:
      return state
  }
}
