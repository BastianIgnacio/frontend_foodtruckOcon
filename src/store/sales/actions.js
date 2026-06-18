export const FETCH_SALES         = 'FETCH_SALES'
export const FETCH_SALES_SUCCESS = 'FETCH_SALES_SUCCESS'
export const FETCH_SALES_FAILURE = 'FETCH_SALES_FAILURE'
export const CREATE_SALE         = 'CREATE_SALE'
export const CREATE_SALE_SUCCESS = 'CREATE_SALE_SUCCESS'
export const CREATE_SALE_FAILURE = 'CREATE_SALE_FAILURE'
export const CANCEL_SALE         = 'CANCEL_SALE'
export const CANCEL_SALE_SUCCESS = 'CANCEL_SALE_SUCCESS'

export const fetchSales        = (params) => ({ type: FETCH_SALES, payload: params })
export const fetchSalesSuccess = (sales) => ({ type: FETCH_SALES_SUCCESS, payload: sales })
export const fetchSalesFailure = (err) => ({ type: FETCH_SALES_FAILURE, payload: err })
export const createSale        = (data, cb) => ({ type: CREATE_SALE, payload: data, cb })
export const createSaleSuccess = (sale) => ({ type: CREATE_SALE_SUCCESS, payload: sale })
export const createSaleFailure = (err) => ({ type: CREATE_SALE_FAILURE, payload: err })
export const cancelSale        = (id) => ({ type: CANCEL_SALE, payload: id })
export const cancelSaleSuccess = (id) => ({ type: CANCEL_SALE_SUCCESS, payload: id })
