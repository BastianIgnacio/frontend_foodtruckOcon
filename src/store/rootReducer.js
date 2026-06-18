import { combineReducers } from 'redux'
import authReducer from './auth/reducer'
import productsReducer from './products/reducer'
import salesReducer from './sales/reducer'
import cashRegisterReducer from './cashRegister/reducer'
import usersReducer from './users/reducer'
import rawMaterialsReducer from './rawMaterials/reducer'
import cartReducer from './cart/reducer'
import pendingOrdersReducer from './pendingOrders/reducer'
import tasksReducer from './tasks/reducer'

export default combineReducers({
  auth: authReducer,
  products: productsReducer,
  sales: salesReducer,
  cashRegister: cashRegisterReducer,
  users: usersReducer,
  rawMaterials: rawMaterialsReducer,
  cart: cartReducer,
  pendingOrders: pendingOrdersReducer,
  tasks: tasksReducer,
})
