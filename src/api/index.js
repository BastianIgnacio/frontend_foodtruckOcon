import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const loginApi = (username, password) => {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}
export const getMeApi = () => api.get('/auth/me')

// Users
export const getUsersApi = () => api.get('/users/')
export const createUserApi = data => api.post('/users/', data)
export const updateUserApi = (id, data) => api.put(`/users/${id}`, data)
export const deleteUserApi = id => api.delete(`/users/${id}`)

// Products
export const getProductsApi = (params) => api.get('/products/', { params })
export const getProductApi = id => api.get(`/products/${id}`)
export const createProductApi = data => api.post('/products/', data)
export const updateProductApi = (id, data) => api.put(`/products/${id}`, data)
export const toggleProductStockApi = id => api.patch(`/products/${id}/toggle-stock`)
export const toggleProductCarouselApi = id => api.patch(`/products/${id}/toggle-carousel`)
export const toggleProductCarousel2Api = id => api.patch(`/products/${id}/toggle-carousel2`)
export const toggleProductCarousel3Api = id => api.patch(`/products/${id}/toggle-carousel3`)
export const deleteProductApi = id => api.delete(`/products/${id}`)

// Raw Materials
export const getRawMaterialsApi = () => api.get('/raw-materials/')
export const createRawMaterialApi = data => api.post('/raw-materials/', data)
export const updateRawMaterialApi = (id, data) => api.put(`/raw-materials/${id}`, data)
export const deleteRawMaterialApi = id => api.delete(`/raw-materials/${id}`)
export const addRawMaterialEntryApi = (id, data) => api.post(`/raw-materials/${id}/entries`, data)
export const getRawMaterialEntriesApi = id => api.get(`/raw-materials/${id}/entries`)

// Product ↔ Raw Material associations
export const getProductRawMaterialsApi = id => api.get(`/products/${id}/raw-materials`)
export const setProductRawMaterialsApi = (id, items) => api.put(`/products/${id}/raw-materials`, items)

// Product subcategories (grupos de opciones)
export const getProductSubcategoriesApi = id => api.get(`/products/${id}/subcategories`)
export const createProductSubcategoryApi = (id, data) => api.post(`/products/${id}/subcategories`, data)
export const updateProductSubcategoryApi = (id, subId, data) => api.put(`/products/${id}/subcategories/${subId}`, data)
export const deleteProductSubcategoryApi = (id, subId) => api.delete(`/products/${id}/subcategories/${subId}`)
export const createSubcategoryItemApi = (id, subId, data) => api.post(`/products/${id}/subcategories/${subId}/items`, data)
export const deleteSubcategoryItemApi = (id, subId, itemId) => api.delete(`/products/${id}/subcategories/${subId}/items/${itemId}`)

// Cash Register
export const getCashRegistersApi = () => api.get('/cash-registers/')
export const getCurrentRegisterApi = () => api.get('/cash-registers/current')
export const openCashRegisterApi = data => api.post('/cash-registers/open', data)
export const closeCashRegisterApi = (id, data) => api.post(`/cash-registers/${id}/close`, data)

// Sales
export const getSalesApi = (params) => api.get('/sales/', { params })
export const getSaleApi = id => api.get(`/sales/${id}`)
export const createSaleApi = data => api.post('/sales/', data)
export const cancelSaleApi = id => api.patch(`/sales/${id}/cancel`)

// Pending Orders (tienda)
export const createPendingOrderApi = data => axios.post('/api/pending-orders/', data)
export const getPendingOrdersApi = (params) => api.get('/pending-orders/', { params })
export const updatePendingOrderStatusApi = (id, data) => api.patch(`/pending-orders/${id}/status`, data)
export const processPendingOrderPaymentApi = (id, data) => api.post(`/pending-orders/${id}/process-payment`, data)
export const deletePendingOrderApi = (id) => api.delete(`/pending-orders/${id}`)

// DB Viewer
export const getDatabaseApi = () => api.get('/db/')

// Printers / Configuraciones
export const getPrintersApi = () => api.get('/printers/')
export const getDefaultPrinterApi = () => api.get('/printers/default')
export const setDefaultPrinterApi = (printer_name) => api.put('/printers/default', { printer_name })
export const printTicketApi = (data) => api.post('/printers/print', data)

// Categories
export const getCategoriesApi = () => api.get('/categories/')
export const createCategoryApi = data => api.post('/categories/', data)
export const updateCategoryApi = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategoryApi = id => api.delete(`/categories/${id}`)

// Tasks
export const getTasksApi = () => api.get('/tasks/')
export const createTaskApi = data => api.post('/tasks/', data)
export const updateTaskApi = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTaskApi = id => api.delete(`/tasks/${id}`)

export default api
