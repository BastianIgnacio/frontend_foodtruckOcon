export const AUTH_LOGIN_REQUEST  = 'AUTH_LOGIN_REQUEST'
export const AUTH_LOGIN_SUCCESS  = 'AUTH_LOGIN_SUCCESS'
export const AUTH_LOGIN_FAILURE  = 'AUTH_LOGIN_FAILURE'
export const AUTH_LOGOUT         = 'AUTH_LOGOUT'
export const AUTH_RESTORE        = 'AUTH_RESTORE'

export const loginRequest  = (username, password) => ({ type: AUTH_LOGIN_REQUEST, payload: { username, password } })
export const loginSuccess  = (user, token) => ({ type: AUTH_LOGIN_SUCCESS, payload: { user, token } })
export const loginFailure  = (error) => ({ type: AUTH_LOGIN_FAILURE, payload: error })
export const logout        = () => ({ type: AUTH_LOGOUT })
export const restoreAuth   = () => ({ type: AUTH_RESTORE })
