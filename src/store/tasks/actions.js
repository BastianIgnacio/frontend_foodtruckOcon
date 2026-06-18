export const FETCH_TASKS         = 'FETCH_TASKS'
export const FETCH_TASKS_SUCCESS = 'FETCH_TASKS_SUCCESS'
export const FETCH_TASKS_FAILURE = 'FETCH_TASKS_FAILURE'
export const CREATE_TASK         = 'CREATE_TASK'
export const CREATE_TASK_SUCCESS = 'CREATE_TASK_SUCCESS'
export const UPDATE_TASK         = 'UPDATE_TASK'
export const UPDATE_TASK_SUCCESS = 'UPDATE_TASK_SUCCESS'
export const DELETE_TASK         = 'DELETE_TASK'
export const DELETE_TASK_SUCCESS = 'DELETE_TASK_SUCCESS'
export const TASK_OP_FAIL        = 'TASK_OP_FAIL'

export const fetchTasks        = () => ({ type: FETCH_TASKS })
export const fetchTasksSuccess = (tasks) => ({ type: FETCH_TASKS_SUCCESS, payload: tasks })
export const fetchTasksFailure = (err) => ({ type: FETCH_TASKS_FAILURE, payload: err })
export const createTask        = (data, cb) => ({ type: CREATE_TASK, payload: data, cb })
export const createTaskSuccess = (task) => ({ type: CREATE_TASK_SUCCESS, payload: task })
export const updateTask        = (id, data, cb) => ({ type: UPDATE_TASK, payload: { id, data }, cb })
export const updateTaskSuccess = (task) => ({ type: UPDATE_TASK_SUCCESS, payload: task })
export const deleteTask        = (id, cb) => ({ type: DELETE_TASK, payload: id, cb })
export const deleteTaskSuccess = (id) => ({ type: DELETE_TASK_SUCCESS, payload: id })
export const taskOpFail        = (err) => ({ type: TASK_OP_FAIL, payload: err })
