export const FETCH_PENDING_ORDERS         = 'FETCH_PENDING_ORDERS'
export const FETCH_PENDING_ORDERS_SUCCESS = 'FETCH_PENDING_ORDERS_SUCCESS'
export const FETCH_PENDING_ORDERS_FAILURE = 'FETCH_PENDING_ORDERS_FAILURE'
export const UPDATE_ORDER_STATUS          = 'UPDATE_ORDER_STATUS'
export const UPDATE_ORDER_STATUS_SUCCESS  = 'UPDATE_ORDER_STATUS_SUCCESS'
export const PROCESS_PAYMENT              = 'PROCESS_PAYMENT'
export const PROCESS_PAYMENT_SUCCESS      = 'PROCESS_PAYMENT_SUCCESS'
export const DELETE_PENDING_ORDER         = 'DELETE_PENDING_ORDER'
export const DELETE_PENDING_ORDER_SUCCESS = 'DELETE_PENDING_ORDER_SUCCESS'
export const WS_ORDER_RECEIVED            = 'WS_ORDER_RECEIVED'
export const WS_ORDER_UPDATED             = 'WS_ORDER_UPDATED'
export const WS_ORDER_DELETED             = 'WS_ORDER_DELETED'

export const fetchPendingOrders        = (params) => ({ type: FETCH_PENDING_ORDERS, payload: params })
export const fetchPendingOrdersSuccess = (data)   => ({ type: FETCH_PENDING_ORDERS_SUCCESS, payload: data })
export const fetchPendingOrdersFailure = (err)    => ({ type: FETCH_PENDING_ORDERS_FAILURE, payload: err })
export const updateOrderStatus         = (id, status, cb) => ({ type: UPDATE_ORDER_STATUS, payload: { id, status }, cb })
export const updateOrderStatusSuccess  = (order)  => ({ type: UPDATE_ORDER_STATUS_SUCCESS, payload: order })
export const processPayment            = (id, data, cb) => ({ type: PROCESS_PAYMENT, payload: { id, data }, cb })
export const processPaymentSuccess     = (order)  => ({ type: PROCESS_PAYMENT_SUCCESS, payload: order })
export const deletePendingOrder        = (id, cb) => ({ type: DELETE_PENDING_ORDER, payload: { id }, cb })
export const deletePendingOrderSuccess = (id)     => ({ type: DELETE_PENDING_ORDER_SUCCESS, payload: id })
export const wsOrderReceived           = (order)  => ({ type: WS_ORDER_RECEIVED, payload: order })
export const wsOrderUpdated            = (data)   => ({ type: WS_ORDER_UPDATED, payload: data })
export const wsOrderDeleted            = (data)   => ({ type: WS_ORDER_DELETED, payload: data })
