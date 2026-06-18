import { call, put, takeLatest } from 'redux-saga/effects'
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi } from '../../api'
import {
  FETCH_USERS, CREATE_USER, UPDATE_USER, DELETE_USER,
  fetchUsersSuccess, fetchUsersFailure,
  createUserSuccess, updateUserSuccess, deleteUserSuccess, userOpFail
} from './actions'

function* handleFetch() {
  try {
    const { data } = yield call(getUsersApi)
    yield put(fetchUsersSuccess(data))
  } catch (err) {
    yield put(fetchUsersFailure(err.response?.data?.detail || 'Error'))
  }
}

function* handleCreate({ payload, cb }) {
  try {
    const { data } = yield call(createUserApi, payload)
    yield put(createUserSuccess(data))
    if (cb) cb(null, data)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al crear usuario'
    yield put(userOpFail(msg))
    if (cb) cb(msg)
  }
}

function* handleUpdate({ payload: { id, data }, cb }) {
  try {
    const { data: user } = yield call(updateUserApi, id, data)
    yield put(updateUserSuccess(user))
    if (cb) cb(null, user)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al actualizar'
    yield put(userOpFail(msg))
    if (cb) cb(msg)
  }
}

function* handleDelete({ payload: id }) {
  try {
    yield call(deleteUserApi, id)
    yield put(deleteUserSuccess(id))
  } catch (err) {
    yield put(userOpFail(err.response?.data?.detail || 'Error'))
  }
}

export default function* usersSaga() {
  yield takeLatest(FETCH_USERS, handleFetch)
  yield takeLatest(CREATE_USER, handleCreate)
  yield takeLatest(UPDATE_USER, handleUpdate)
  yield takeLatest(DELETE_USER, handleDelete)
}
