export const FETCH_USERS         = 'FETCH_USERS'
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS'
export const FETCH_USERS_FAILURE = 'FETCH_USERS_FAILURE'
export const CREATE_USER         = 'CREATE_USER'
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS'
export const UPDATE_USER         = 'UPDATE_USER'
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS'
export const DELETE_USER         = 'DELETE_USER'
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS'
export const USER_OP_FAIL        = 'USER_OP_FAIL'

export const fetchUsers        = () => ({ type: FETCH_USERS })
export const fetchUsersSuccess = (users) => ({ type: FETCH_USERS_SUCCESS, payload: users })
export const fetchUsersFailure = (err) => ({ type: FETCH_USERS_FAILURE, payload: err })
export const createUser        = (data, cb) => ({ type: CREATE_USER, payload: data, cb })
export const createUserSuccess = (user) => ({ type: CREATE_USER_SUCCESS, payload: user })
export const updateUser        = (id, data, cb) => ({ type: UPDATE_USER, payload: { id, data }, cb })
export const updateUserSuccess = (user) => ({ type: UPDATE_USER_SUCCESS, payload: user })
export const deleteUser        = (id) => ({ type: DELETE_USER, payload: id })
export const deleteUserSuccess = (id) => ({ type: DELETE_USER_SUCCESS, payload: id })
export const userOpFail        = (err) => ({ type: USER_OP_FAIL, payload: err })
