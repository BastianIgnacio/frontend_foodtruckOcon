export const FETCH_RAW_MATERIALS         = 'FETCH_RAW_MATERIALS'
export const FETCH_RAW_MATERIALS_SUCCESS = 'FETCH_RAW_MATERIALS_SUCCESS'
export const FETCH_RAW_MATERIALS_FAILURE = 'FETCH_RAW_MATERIALS_FAILURE'
export const CREATE_RAW_MATERIAL         = 'CREATE_RAW_MATERIAL'
export const CREATE_RAW_MATERIAL_SUCCESS = 'CREATE_RAW_MATERIAL_SUCCESS'
export const UPDATE_RAW_MATERIAL         = 'UPDATE_RAW_MATERIAL'
export const UPDATE_RAW_MATERIAL_SUCCESS = 'UPDATE_RAW_MATERIAL_SUCCESS'
export const ADD_RAW_MATERIAL_ENTRY      = 'ADD_RAW_MATERIAL_ENTRY'
export const ADD_RAW_MATERIAL_ENTRY_SUCCESS = 'ADD_RAW_MATERIAL_ENTRY_SUCCESS'
export const DELETE_RAW_MATERIAL         = 'DELETE_RAW_MATERIAL'
export const DELETE_RAW_MATERIAL_SUCCESS = 'DELETE_RAW_MATERIAL_SUCCESS'
export const RAW_MATERIAL_OP_FAIL        = 'RAW_MATERIAL_OP_FAIL'

export const fetchRawMaterials        = () => ({ type: FETCH_RAW_MATERIALS })
export const fetchRawMaterialsSuccess = (data) => ({ type: FETCH_RAW_MATERIALS_SUCCESS, payload: data })
export const fetchRawMaterialsFailure = (err) => ({ type: FETCH_RAW_MATERIALS_FAILURE, payload: err })
export const createRawMaterial        = (data, cb) => ({ type: CREATE_RAW_MATERIAL, payload: data, cb })
export const createRawMaterialSuccess = (data) => ({ type: CREATE_RAW_MATERIAL_SUCCESS, payload: data })
export const updateRawMaterial        = (id, data, cb) => ({ type: UPDATE_RAW_MATERIAL, payload: { id, data }, cb })
export const updateRawMaterialSuccess = (data) => ({ type: UPDATE_RAW_MATERIAL_SUCCESS, payload: data })
export const addRawMaterialEntry      = (id, data, cb) => ({ type: ADD_RAW_MATERIAL_ENTRY, payload: { id, data }, cb })
export const addRawMaterialEntrySuccess = (data) => ({ type: ADD_RAW_MATERIAL_ENTRY_SUCCESS, payload: data })
export const deleteRawMaterial        = (id, cb) => ({ type: DELETE_RAW_MATERIAL, payload: id, cb })
export const deleteRawMaterialSuccess = (id) => ({ type: DELETE_RAW_MATERIAL_SUCCESS, payload: id })
export const rawMaterialOpFail        = (err) => ({ type: RAW_MATERIAL_OP_FAIL, payload: err })
