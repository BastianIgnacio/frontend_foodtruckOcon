import {
  FETCH_PRODUCTS, FETCH_PRODUCTS_SUCCESS, FETCH_PRODUCTS_FAILURE,
  CREATE_PRODUCT_SUCCESS, UPDATE_PRODUCT_SUCCESS, TOGGLE_STOCK_SUCCESS,
  PRODUCT_OPERATION_FAIL
} from './actions'

const initial = { list: [], loading: false, error: null }

export default function productsReducer(state = initial, action) {
  switch (action.type) {
    case FETCH_PRODUCTS:
      return { ...state, loading: true, error: null }
    case FETCH_PRODUCTS_SUCCESS:
      return { ...state, loading: false, list: action.payload }
    case FETCH_PRODUCTS_FAILURE:
    case PRODUCT_OPERATION_FAIL:
      return { ...state, loading: false, error: action.payload }
    case CREATE_PRODUCT_SUCCESS:
      return { ...state, list: [action.payload, ...state.list] }
    case UPDATE_PRODUCT_SUCCESS:
    case TOGGLE_STOCK_SUCCESS:
      return {
        ...state,
        list: state.list.map(p => p.id === action.payload.id ? action.payload : p)
      }
    default:
      return state
  }
}
