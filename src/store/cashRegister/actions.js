export const FETCH_REGISTERS         = 'FETCH_REGISTERS'
export const FETCH_REGISTERS_SUCCESS = 'FETCH_REGISTERS_SUCCESS'
export const FETCH_REGISTERS_FAILURE = 'FETCH_REGISTERS_FAILURE'
export const FETCH_CURRENT_REGISTER         = 'FETCH_CURRENT_REGISTER'
export const FETCH_CURRENT_REGISTER_SUCCESS = 'FETCH_CURRENT_REGISTER_SUCCESS'
export const FETCH_CURRENT_REGISTER_FAILURE = 'FETCH_CURRENT_REGISTER_FAILURE'
export const OPEN_REGISTER         = 'OPEN_REGISTER'
export const OPEN_REGISTER_SUCCESS = 'OPEN_REGISTER_SUCCESS'
export const OPEN_REGISTER_FAILURE = 'OPEN_REGISTER_FAILURE'
export const CLOSE_REGISTER         = 'CLOSE_REGISTER'
export const CLOSE_REGISTER_SUCCESS = 'CLOSE_REGISTER_SUCCESS'
export const CLOSE_REGISTER_FAILURE = 'CLOSE_REGISTER_FAILURE'

export const fetchRegisters           = () => ({ type: FETCH_REGISTERS })
export const fetchRegistersSuccess    = (data) => ({ type: FETCH_REGISTERS_SUCCESS, payload: data })
export const fetchRegistersFailure    = (err) => ({ type: FETCH_REGISTERS_FAILURE, payload: err })
export const fetchCurrentRegister     = () => ({ type: FETCH_CURRENT_REGISTER })
export const fetchCurrentSuccess      = (data) => ({ type: FETCH_CURRENT_REGISTER_SUCCESS, payload: data })
export const fetchCurrentFailure      = () => ({ type: FETCH_CURRENT_REGISTER_FAILURE })
export const openRegister             = (data, cb) => ({ type: OPEN_REGISTER, payload: data, cb })
export const openRegisterSuccess      = (data) => ({ type: OPEN_REGISTER_SUCCESS, payload: data })
export const openRegisterFailure      = (err) => ({ type: OPEN_REGISTER_FAILURE, payload: err })
export const closeRegister            = (id, data, cb) => ({ type: CLOSE_REGISTER, payload: { id, data }, cb })
export const closeRegisterSuccess     = (data) => ({ type: CLOSE_REGISTER_SUCCESS, payload: data })
export const closeRegisterFailure     = (err) => ({ type: CLOSE_REGISTER_FAILURE, payload: err })
