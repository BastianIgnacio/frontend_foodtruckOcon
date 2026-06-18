import { call, put, takeLatest } from 'redux-saga/effects'
import { getRawMaterialsApi, createRawMaterialApi, updateRawMaterialApi, addRawMaterialEntryApi, deleteRawMaterialApi } from '../../api'
import {
  FETCH_RAW_MATERIALS, CREATE_RAW_MATERIAL, UPDATE_RAW_MATERIAL, ADD_RAW_MATERIAL_ENTRY, DELETE_RAW_MATERIAL,
  fetchRawMaterialsSuccess, fetchRawMaterialsFailure,
  createRawMaterialSuccess, updateRawMaterialSuccess,
  addRawMaterialEntrySuccess, deleteRawMaterialSuccess, rawMaterialOpFail
} from './actions'

function* handleFetch() {
  try {
    const { data } = yield call(getRawMaterialsApi)
    yield put(fetchRawMaterialsSuccess(data))
  } catch (err) {
    yield put(fetchRawMaterialsFailure(err.response?.data?.detail || 'Error'))
  }
}

function* handleCreate({ payload, cb }) {
  try {
    const { data } = yield call(createRawMaterialApi, payload)
    yield put(createRawMaterialSuccess(data))
    if (cb) cb(null, data)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error'
    yield put(rawMaterialOpFail(msg))
    if (cb) cb(msg)
  }
}

function* handleUpdate({ payload: { id, data }, cb }) {
  try {
    const { data: material } = yield call(updateRawMaterialApi, id, data)
    yield put(updateRawMaterialSuccess(material))
    if (cb) cb(null, material)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error'
    yield put(rawMaterialOpFail(msg))
    if (cb) cb(msg)
  }
}

function* handleAddEntry({ payload: { id, data }, cb }) {
  try {
    const { data: entry } = yield call(addRawMaterialEntryApi, id, data)
    yield put(addRawMaterialEntrySuccess(entry))
    if (cb) cb(null, entry)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error'
    yield put(rawMaterialOpFail(msg))
    if (cb) cb(msg)
  }
}

function* handleDelete({ payload: id, cb }) {
  try {
    yield call(deleteRawMaterialApi, id)
    yield put(deleteRawMaterialSuccess(id))
    if (cb) cb(null)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error'
    yield put(rawMaterialOpFail(msg))
    if (cb) cb(msg)
  }
}

export default function* rawMaterialsSaga() {
  yield takeLatest(FETCH_RAW_MATERIALS, handleFetch)
  yield takeLatest(CREATE_RAW_MATERIAL, handleCreate)
  yield takeLatest(UPDATE_RAW_MATERIAL, handleUpdate)
  yield takeLatest(ADD_RAW_MATERIAL_ENTRY, handleAddEntry)
  yield takeLatest(DELETE_RAW_MATERIAL, handleDelete)
}
