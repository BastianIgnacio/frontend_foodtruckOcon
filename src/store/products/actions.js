export const FETCH_PRODUCTS         = 'FETCH_PRODUCTS'
export const FETCH_PRODUCTS_SUCCESS = 'FETCH_PRODUCTS_SUCCESS'
export const FETCH_PRODUCTS_FAILURE = 'FETCH_PRODUCTS_FAILURE'
export const CREATE_PRODUCT         = 'CREATE_PRODUCT'
export const CREATE_PRODUCT_SUCCESS = 'CREATE_PRODUCT_SUCCESS'
export const UPDATE_PRODUCT         = 'UPDATE_PRODUCT'
export const UPDATE_PRODUCT_SUCCESS = 'UPDATE_PRODUCT_SUCCESS'
export const TOGGLE_STOCK           = 'TOGGLE_STOCK'
export const TOGGLE_STOCK_SUCCESS   = 'TOGGLE_STOCK_SUCCESS'
export const DELETE_PRODUCT         = 'DELETE_PRODUCT'
export const PRODUCT_OPERATION_FAIL = 'PRODUCT_OPERATION_FAIL'

export const fetchProducts        = (params) => ({ type: FETCH_PRODUCTS, payload: params })
export const fetchProductsSuccess = (products) => ({ type: FETCH_PRODUCTS_SUCCESS, payload: products })
export const fetchProductsFailure = (err) => ({ type: FETCH_PRODUCTS_FAILURE, payload: err })
export const createProduct        = (data, cb) => ({ type: CREATE_PRODUCT, payload: data, cb })
export const createProductSuccess = (product) => ({ type: CREATE_PRODUCT_SUCCESS, payload: product })
export const updateProduct        = (id, data, cb) => ({ type: UPDATE_PRODUCT, payload: { id, data }, cb })
export const updateProductSuccess = (product) => ({ type: UPDATE_PRODUCT_SUCCESS, payload: product })
export const toggleStock          = (id) => ({ type: TOGGLE_STOCK, payload: id })
export const toggleStockSuccess   = (product) => ({ type: TOGGLE_STOCK_SUCCESS, payload: product })
export const deleteProduct        = (id) => ({ type: DELETE_PRODUCT, payload: id })
export const productOperationFail = (err) => ({ type: PRODUCT_OPERATION_FAIL, payload: err })
