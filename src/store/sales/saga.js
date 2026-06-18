import { call, put, takeLatest } from 'redux-saga/effects'
import { getSalesApi, createSaleApi, cancelSaleApi } from '../../api'
import {
  FETCH_SALES, CREATE_SALE, CANCEL_SALE,
  fetchSalesSuccess, fetchSalesFailure,
  createSaleSuccess, createSaleFailure, cancelSaleSuccess
} from './actions'

function* handleFetch({ payload }) {
  try {
    const response = yield call(getSalesApi, payload)
    const total = parseInt(response.headers['x-total-count'] || '0', 10)
    yield put(fetchSalesSuccess({ list: response.data, total }))
  } catch (err) {
    yield put(fetchSalesFailure(err.response?.data?.detail || 'Error'))
  }
}

function* handleCreate({ payload, cb }) {
  try {
    const { data } = yield call(createSaleApi, payload)
    yield put(createSaleSuccess(data))
    if (cb) cb(null, data)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al crear venta'
    yield put(createSaleFailure(msg))
    if (cb) cb(msg)
  }
}

function* handleCancel({ payload: id }) {
  try {
    yield call(cancelSaleApi, id)
    yield put(cancelSaleSuccess(id))
  } catch (err) {
    console.error('Error cancelando venta:', err)
  }
}

export default function* salesSaga() {
  yield takeLatest(FETCH_SALES, handleFetch)
  yield takeLatest(CREATE_SALE, handleCreate)
  yield takeLatest(CANCEL_SALE, handleCancel)
}
