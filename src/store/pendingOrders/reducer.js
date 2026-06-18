import {
  FETCH_PENDING_ORDERS, FETCH_PENDING_ORDERS_SUCCESS, FETCH_PENDING_ORDERS_FAILURE,
  UPDATE_ORDER_STATUS_SUCCESS, PROCESS_PAYMENT_SUCCESS,
  DELETE_PENDING_ORDER_SUCCESS, WS_ORDER_RECEIVED, WS_ORDER_UPDATED, WS_ORDER_DELETED
} from './actions'

const initial = { list: [], loading: false, error: null }

export default function pendingOrdersReducer(state = initial, action) {
  switch (action.type) {
    case FETCH_PENDING_ORDERS:
      return { ...state, loading: true, error: null }
    case FETCH_PENDING_ORDERS_SUCCESS:
      return { ...state, loading: false, list: action.payload }
    case FETCH_PENDING_ORDERS_FAILURE:
      return { ...state, loading: false, error: action.payload }

    case UPDATE_ORDER_STATUS_SUCCESS:
    case PROCESS_PAYMENT_SUCCESS:
      return {
        ...state,
        list: state.list.map(o => o.id === action.payload.id ? action.payload : o)
      }

    case DELETE_PENDING_ORDER_SUCCESS:
    case WS_ORDER_DELETED:
      return { ...state, list: state.list.filter(o => o.id !== action.payload) }

    case WS_ORDER_RECEIVED:
      return {
        ...state,
        list: [action.payload, ...state.list]
      }

    case WS_ORDER_UPDATED:
      return {
        ...state,
        list: state.list.map(o =>
          o.id === action.payload.id
            ? { ...o, status: action.payload.status, notes: action.payload.notes ?? o.notes }
            : o
        )
      }

    default:
      return state
  }
}
