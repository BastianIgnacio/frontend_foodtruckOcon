import {
  FETCH_SALES, FETCH_SALES_SUCCESS, FETCH_SALES_FAILURE,
  CREATE_SALE, CREATE_SALE_SUCCESS, CREATE_SALE_FAILURE,
  CANCEL_SALE_SUCCESS
} from './actions'

const initial = { list: [], total: 0, loading: false, creating: false, error: null, lastSale: null }

export default function salesReducer(state = initial, action) {
  switch (action.type) {
    case FETCH_SALES:
      return { ...state, loading: true, error: null }
    case FETCH_SALES_SUCCESS:
      return { ...state, loading: false, list: action.payload.list, total: action.payload.total }
    case FETCH_SALES_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case CREATE_SALE:
      return { ...state, creating: true, error: null }
    case CREATE_SALE_SUCCESS:
      return { ...state, creating: false, lastSale: action.payload, list: [action.payload, ...state.list] }
    case CREATE_SALE_FAILURE:
      return { ...state, creating: false, error: action.payload }
    case CANCEL_SALE_SUCCESS:
      return {
        ...state,
        list: state.list.map(s => s.id === action.payload ? { ...s, status: 'CANCELLED' } : s)
      }
    default:
      return state
  }
}
