import {
  AUTH_LOGIN_REQUEST, AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILURE,
  AUTH_LOGOUT, AUTH_RESTORE
} from './actions'

const stored = () => {
  try {
    return {
      user:  JSON.parse(localStorage.getItem('user') || 'null'),
      token: localStorage.getItem('token') || null,
    }
  } catch { return { user: null, token: null } }
}

const { user, token } = stored()

const initial = {
  user,
  token,
  loading: false,
  error: null,
  isAuthenticated: !!token,
}

export default function authReducer(state = initial, action) {
  switch (action.type) {
    case AUTH_LOGIN_REQUEST:
      return { ...state, loading: true, error: null }
    case AUTH_LOGIN_SUCCESS:
      return { ...state, loading: false, user: action.payload.user, token: action.payload.token, isAuthenticated: true }
    case AUTH_LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case AUTH_LOGOUT:
    case AUTH_RESTORE:
      return { ...initial, user: null, token: null, isAuthenticated: false }
    default:
      return state
  }
}
