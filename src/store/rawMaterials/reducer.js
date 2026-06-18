import {
  FETCH_RAW_MATERIALS, FETCH_RAW_MATERIALS_SUCCESS, FETCH_RAW_MATERIALS_FAILURE,
  CREATE_RAW_MATERIAL_SUCCESS, UPDATE_RAW_MATERIAL_SUCCESS,
  ADD_RAW_MATERIAL_ENTRY_SUCCESS, DELETE_RAW_MATERIAL_SUCCESS, RAW_MATERIAL_OP_FAIL
} from './actions'

const initial = { list: [], loading: false, error: null }

export default function rawMaterialsReducer(state = initial, action) {
  switch (action.type) {
    case FETCH_RAW_MATERIALS:
      return { ...state, loading: true, error: null }
    case FETCH_RAW_MATERIALS_SUCCESS:
      return { ...state, loading: false, list: action.payload }
    case FETCH_RAW_MATERIALS_FAILURE:
    case RAW_MATERIAL_OP_FAIL:
      return { ...state, loading: false, error: action.payload }
    case CREATE_RAW_MATERIAL_SUCCESS:
      return { ...state, list: [...state.list, action.payload] }
    case UPDATE_RAW_MATERIAL_SUCCESS:
      return { ...state, list: state.list.map(m => m.id === action.payload.id ? action.payload : m) }
    case ADD_RAW_MATERIAL_ENTRY_SUCCESS: {
      const { raw_material_id, quantity } = action.payload
      return {
        ...state,
        list: state.list.map(m =>
          m.id === raw_material_id ? { ...m, quantity: m.quantity + quantity } : m
        )
      }
    }
    case DELETE_RAW_MATERIAL_SUCCESS:
      return { ...state, list: state.list.filter(m => m.id !== action.payload) }
    default:
      return state
  }
}
