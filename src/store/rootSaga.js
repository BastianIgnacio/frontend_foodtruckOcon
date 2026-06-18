import { all } from 'redux-saga/effects'
import authSaga from './auth/saga'
import productsSaga from './products/saga'
import salesSaga from './sales/saga'
import cashRegisterSaga from './cashRegister/saga'
import usersSaga from './users/saga'
import rawMaterialsSaga from './rawMaterials/saga'
import pendingOrdersSaga from './pendingOrders/saga'
import tasksSaga from './tasks/saga'

export default function* rootSaga() {
  yield all([
    authSaga(),
    productsSaga(),
    salesSaga(),
    cashRegisterSaga(),
    usersSaga(),
    rawMaterialsSaga(),
    pendingOrdersSaga(),
    tasksSaga(),
  ])
}
