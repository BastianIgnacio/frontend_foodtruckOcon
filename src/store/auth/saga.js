import { call, put, takeLatest } from 'redux-saga/effects'
import { loginApi } from '../../api'
import {
  AUTH_LOGIN_REQUEST, AUTH_LOGOUT,
  loginSuccess, loginFailure
} from './actions'

function* handleLogin({ payload: { username, password } }) {
  try {
    const { data } = yield call(loginApi, username, password)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    yield put(loginSuccess(data.user, data.access_token))
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al iniciar sesión'
    yield put(loginFailure(msg))
  }
}

function* handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export default function* authSaga() {
  yield takeLatest(AUTH_LOGIN_REQUEST, handleLogin)
  yield takeLatest(AUTH_LOGOUT, handleLogout)
}
