import {
  FETCH_USERS, FETCH_USERS_SUCCESS, FETCH_USERS_FAILURE,
  CREATE_USER_SUCCESS, UPDATE_USER_SUCCESS, DELETE_USER_SUCCESS, USER_OP_FAIL
} from './actions'

const initial = { list: [], loading: false, error: null }

export default function usersReducer(state = initial, action) {
  switch (action.type) {
    case FETCH_USERS:
      return { ...state, loading: true, error: null }
    case FETCH_USERS_SUCCESS:
      return { ...state, loading: false, list: Array.isArray(action.payload) ? action.payload : [] }
    case FETCH_USERS_FAILURE:
    case USER_OP_FAIL:
      return { ...state, loading: false, error: action.payload }
    case CREATE_USER_SUCCESS:
      return { ...state, list: [...state.list, action.payload] }
    case UPDATE_USER_SUCCESS:
      return { ...state, list: state.list.map(u => u.id === action.payload.id ? action.payload : u) }
    case DELETE_USER_SUCCESS:
      return { ...state, list: state.list.map(u => u.id === action.payload ? { ...u, is_active: false } : u) }
    default:
      return state
  }
}
