import { call, put, takeLatest } from 'redux-saga/effects'
import { getCashRegistersApi, getCurrentRegisterApi, openCashRegisterApi, closeCashRegisterApi } from '../../api'
import {
  FETCH_REGISTERS, FETCH_CURRENT_REGISTER, OPEN_REGISTER, CLOSE_REGISTER,
  fetchRegistersSuccess, fetchRegistersFailure,
  fetchCurrentSuccess, fetchCurrentFailure,
  openRegisterSuccess, openRegisterFailure,
  closeRegisterSuccess, closeRegisterFailure
} from './actions'

function* handleFetchAll() {
  try {
    const { data } = yield call(getCashRegistersApi)
    yield put(fetchRegistersSuccess(data))
  } catch (err) {
    yield put(fetchRegistersFailure(err.response?.data?.detail || 'Error'))
  }
}

function* handleFetchCurrent() {
  try {
    const { data } = yield call(getCurrentRegisterApi)
    yield put(fetchCurrentSuccess(data))
  } catch {
    yield put(fetchCurrentFailure())
  }
}

function* handleOpen({ payload, cb }) {
  try {
    const { data } = yield call(openCashRegisterApi, payload)
    yield put(openRegisterSuccess(data))
    if (cb) cb(null, data)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al abrir caja'
    yield put(openRegisterFailure(msg))
    if (cb) cb(msg)
  }
}

function* handleClose({ payload: { id, data }, cb }) {
  try {
    const { data: register } = yield call(closeCashRegisterApi, id, data)
    yield put(closeRegisterSuccess(register))
    if (cb) cb(null, register)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al cerrar caja'
    yield put(closeRegisterFailure(msg))
    if (cb) cb(msg)
  }
}

export default function* cashRegisterSaga() {
  yield takeLatest(FETCH_REGISTERS, handleFetchAll)
  yield takeLatest(FETCH_CURRENT_REGISTER, handleFetchCurrent)
  yield takeLatest(OPEN_REGISTER, handleOpen)
  yield takeLatest(CLOSE_REGISTER, handleClose)
}
