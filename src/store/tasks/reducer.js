import {
  FETCH_TASKS, FETCH_TASKS_SUCCESS, FETCH_TASKS_FAILURE,
  CREATE_TASK_SUCCESS, UPDATE_TASK_SUCCESS, DELETE_TASK_SUCCESS,
  TASK_OP_FAIL
} from './actions'

const initial = { list: [], loading: false, error: null }

export default function tasksReducer(state = initial, action) {
  switch (action.type) {
    case FETCH_TASKS:
      return { ...state, loading: true, error: null }
    case FETCH_TASKS_SUCCESS:
      return { ...state, loading: false, list: Array.isArray(action.payload) ? action.payload : [] }
    case FETCH_TASKS_FAILURE:
    case TASK_OP_FAIL:
      return { ...state, loading: false, error: action.payload }
    case CREATE_TASK_SUCCESS:
      return { ...state, list: [action.payload, ...state.list] }
    case UPDATE_TASK_SUCCESS:
      return {
        ...state,
        list: state.list.map(t => t.id === action.payload.id ? action.payload : t)
      }
    case DELETE_TASK_SUCCESS:
      return { ...state, list: state.list.filter(t => t.id !== action.payload) }
    default:
      return state
  }
}
