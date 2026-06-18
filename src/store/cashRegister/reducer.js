import {
  FETCH_REGISTERS, FETCH_REGISTERS_SUCCESS, FETCH_REGISTERS_FAILURE,
  FETCH_CURRENT_REGISTER, FETCH_CURRENT_REGISTER_SUCCESS, FETCH_CURRENT_REGISTER_FAILURE,
  OPEN_REGISTER_SUCCESS, OPEN_REGISTER_FAILURE,
  CLOSE_REGISTER_SUCCESS, CLOSE_REGISTER_FAILURE
} from './actions'

const initial = { list: [], current: null, loading: false, error: null }

export default function cashRegisterReducer(state = initial, action) {
  switch (action.type) {
    case FETCH_REGISTERS:
    case FETCH_CURRENT_REGISTER:
      return { ...state, loading: true, error: null }
    case FETCH_REGISTERS_SUCCESS:
      return { ...state, loading: false, list: action.payload }
    case FETCH_REGISTERS_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case FETCH_CURRENT_REGISTER_SUCCESS:
      return { ...state, loading: false, current: action.payload }
    case FETCH_CURRENT_REGISTER_FAILURE:
      return { ...state, loading: false, current: null }
    case OPEN_REGISTER_SUCCESS:
      return { ...state, current: action.payload, list: [action.payload, ...state.list] }
    case OPEN_REGISTER_FAILURE:
      return { ...state, error: action.payload }
    case CLOSE_REGISTER_SUCCESS:
      return {
        ...state,
        current: null,
        list: state.list.map(r => r.id === action.payload.id ? action.payload : r)
      }
    case CLOSE_REGISTER_FAILURE:
      return { ...state, error: action.payload }
    default:
      return state
  }
}
