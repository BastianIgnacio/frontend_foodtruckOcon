import { call, put, takeLatest, takeEvery } from 'redux-saga/effects'
import { getPendingOrdersApi, updatePendingOrderStatusApi, processPendingOrderPaymentApi, deletePendingOrderApi } from '../../api'
import {
  FETCH_PENDING_ORDERS, UPDATE_ORDER_STATUS, PROCESS_PAYMENT, DELETE_PENDING_ORDER,
  fetchPendingOrdersSuccess, fetchPendingOrdersFailure,
  updateOrderStatusSuccess, processPaymentSuccess, deletePendingOrderSuccess
} from './actions'

function* handleFetch({ payload }) {
  try {
    const { data } = yield call(getPendingOrdersApi, payload)
    yield put(fetchPendingOrdersSuccess(data))
  } catch (err) {
    yield put(fetchPendingOrdersFailure(err.response?.data?.detail || 'Error'))
  }
}

function* handleUpdateStatus({ payload: { id, status }, cb }) {
  try {
    const { data } = yield call(updatePendingOrderStatusApi, id, { status })
    yield put(updateOrderStatusSuccess(data))
    if (cb) cb(null, data)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al actualizar'
    if (cb) cb(msg)
  }
}

function* handleProcessPayment({ payload: { id, data }, cb }) {
  try {
    const { data: order } = yield call(processPendingOrderPaymentApi, id, data)
    yield put(processPaymentSuccess(order))
    if (cb) cb(null, order)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al procesar el pago'
    if (cb) cb(msg)
  }
}

function* handleDeleteOrder({ payload: { id }, cb }) {
  try {
    yield call(deletePendingOrderApi, id)
    yield put(deletePendingOrderSuccess(id))
    if (cb) cb(null)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al cancelar el pedido'
    if (cb) cb(msg)
  }
}

export default function* pendingOrdersSaga() {
  yield takeLatest(FETCH_PENDING_ORDERS, handleFetch)
  yield takeEvery(UPDATE_ORDER_STATUS, handleUpdateStatus)
  yield takeEvery(PROCESS_PAYMENT, handleProcessPayment)
  yield takeEvery(DELETE_PENDING_ORDER, handleDeleteOrder)
}
