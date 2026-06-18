import { call, put, takeLatest } from 'redux-saga/effects'
import { getTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from '../../api'
import {
  FETCH_TASKS, CREATE_TASK, UPDATE_TASK, DELETE_TASK,
  fetchTasksSuccess, fetchTasksFailure,
  createTaskSuccess, updateTaskSuccess, deleteTaskSuccess,
  taskOpFail
} from './actions'

function* handleFetch() {
  try {
    const { data } = yield call(getTasksApi)
    yield put(fetchTasksSuccess(data))
  } catch (err) {
    yield put(fetchTasksFailure(err.response?.data?.detail || 'Error al cargar tareas'))
  }
}

function* handleCreate({ payload, cb }) {
  try {
    const { data } = yield call(createTaskApi, payload)
    yield put(createTaskSuccess(data))
    if (cb) cb(null, data)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al crear tarea'
    yield put(taskOpFail(msg))
    if (cb) cb(msg)
  }
}

function* handleUpdate({ payload: { id, data }, cb }) {
  try {
    const { data: task } = yield call(updateTaskApi, id, data)
    yield put(updateTaskSuccess(task))
    if (cb) cb(null, task)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al actualizar tarea'
    yield put(taskOpFail(msg))
    if (cb) cb(msg)
  }
}

function* handleDelete({ payload: id, cb }) {
  try {
    yield call(deleteTaskApi, id)
    yield put(deleteTaskSuccess(id))
    if (cb) cb(null)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Error al eliminar tarea'
    yield put(taskOpFail(msg))
    if (cb) cb(msg)
  }
}

export default function* tasksSaga() {
  yield takeLatest(FETCH_TASKS, handleFetch)
  yield takeLatest(CREATE_TASK, handleCreate)
  yield takeLatest(UPDATE_TASK, handleUpdate)
  yield takeLatest(DELETE_TASK, handleDelete)
}
