import { call, put, takeLatest } from 'redux-saga/effects'
import {
  getProductsApi, createProductApi, updateProductApi,
  toggleProductStockApi, deleteProductApi
} from '../../api'
import {
  FETCH_PRODUCTS, CREATE_PRODUCT, UPDATE_PRODUCT, TOGGLE_STOCK, DELETE_PRODUCT,
  fetchProductsSuccess, fetchProductsFailure,
  createProductSuccess, updateProductSuccess, toggleStockSuccess,
  fetchProducts, productOperationFail
} from './actions'

function* handleFetch({ payload }) {
  try {
    const { data } = yield call(getProductsApi, payload)
    yield put(fetchProductsSuccess(data))
  } catch (err) {
    yield put(fetchProductsFailure(err.response?.data?.detail || 'Error'))
  }
}

function* handleCreate({ payload, cb }) {
  try {
    const { data } = yield call(createProductApi, payload)
    yield put(createProductSuccess(data))
    if (cb) cb(null, data)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al crear producto'
    yield put(productOperationFail(msg))
    if (cb) cb(msg)
  }
}

function* handleUpdate({ payload: { id, data }, cb }) {
  try {
    const { data: product } = yield call(updateProductApi, id, data)
    yield put(updateProductSuccess(product))
    if (cb) cb(null, product)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al actualizar'
    yield put(productOperationFail(msg))
    if (cb) cb(msg)
  }
}

function* handleToggleStock({ payload: id }) {
  try {
    const { data } = yield call(toggleProductStockApi, id)
    yield put(toggleStockSuccess(data))
  } catch (err) {
    yield put(productOperationFail(err.response?.data?.detail || 'Error'))
  }
}

function* handleDelete({ payload: id }) {
  try {
    yield call(deleteProductApi, id)
    yield put(fetchProducts())
  } catch (err) {
    yield put(productOperationFail(err.response?.data?.detail || 'Error'))
  }
}

export default function* productsSaga() {
  yield takeLatest(FETCH_PRODUCTS, handleFetch)
  yield takeLatest(CREATE_PRODUCT, handleCreate)
  yield takeLatest(UPDATE_PRODUCT, handleUpdate)
  yield takeLatest(TOGGLE_STOCK, handleToggleStock)
  yield takeLatest(DELETE_PRODUCT, handleDelete)
}
