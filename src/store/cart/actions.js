export const CART_ADD_ITEM    = 'CART_ADD_ITEM'
export const CART_REMOVE_ITEM = 'CART_REMOVE_ITEM'
export const CART_UPDATE_QTY  = 'CART_UPDATE_QTY'
export const CART_CLEAR       = 'CART_CLEAR'

export const cartAddItem    = (product) => ({ type: CART_ADD_ITEM, payload: product })
export const cartRemoveItem = (cartKey) => ({ type: CART_REMOVE_ITEM, payload: cartKey })
export const cartUpdateQty  = (cartKey, qty) => ({ type: CART_UPDATE_QTY, payload: { cartKey, qty } })
export const cartClear      = () => ({ type: CART_CLEAR })
