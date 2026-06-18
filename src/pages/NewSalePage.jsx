import { useEffect, useState, useRef } from 'react'
import {
  Grid, Card, CardContent, Typography, Box, TextField, Button,
  Chip, IconButton, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, InputAdornment, Badge, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SearchIcon from '@mui/icons-material/Search'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../store/products/actions'
import { cartAddItem, cartRemoveItem, cartUpdateQty, cartClear } from '../store/cart/actions'
import { createSale } from '../store/sales/actions'
import { fetchCurrentRegister } from '../store/cashRegister/actions'
import SaleTicket from '../components/Ticket/SaleTicket'
import { useNavigate } from 'react-router-dom'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
const PAY_METHODS = [
  { value: 'CASH',     label: 'Efectivo' },
  { value: 'CARD',     label: 'Tarjeta' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'JUNAEB',   label: 'JUNAEB' },
]

export default function NewSalePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list: products, loading } = useSelector(s => s.products)
  const { items: cartItems } = useSelector(s => s.cart)
  const { current: register } = useSelector(s => s.cashRegister)
  const { creating, error: saleError } = useSelector(s => s.sales)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [payDialog, setPayDialog] = useState(false)
  const [payMethod, setPayMethod] = useState('CASH')
  const [amountReceived, setAmountReceived] = useState('')
  const [junaebCode, setJunaebCode] = useState('')
  const [junaebCodeError, setJunaebCodeError] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerNameError, setCustomerNameError] = useState(false)
  const [successSale, setSuccessSale] = useState(null)

  const [subcatDialog, setSubcatDialog] = useState(null)
  const [subSelections, setSubSelections] = useState({})

  useEffect(() => {
    dispatch(fetchProducts({ active_only: true }))
    dispatch(fetchCurrentRegister())
  }, [dispatch])

  const activeCategories = ['Todos', ...new Set(products.filter(p => p.is_active).map(p => p.category))]

  const filteredProducts = products.filter(p => {
    if (!p.is_active) return false
    if (category !== 'Todos' && p.category !== category) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const subtotal = cartItems.reduce((acc, i) => acc + i.quantity * i.unit_price, 0)
  const total = subtotal - Number(discount || 0)
  const change = payMethod === 'CASH' && amountReceived ? Number(amountReceived) - total : 0

  const handleProductClick = (product) => {
    if (product.is_out_of_stock) return
    const hasSubcats = product.subcategories?.some(s => s.items?.length > 0)
    if (hasSubcats) {
      setSubcatDialog(product)
      setSubSelections({})
    } else {
      dispatch(cartAddItem(product))
    }
  }

  const toggleSubItem = (subcatId, item, maxChoices) => {
    setSubSelections(prev => {
      const current = prev[subcatId] || []
      const isSelected = current.some(i => i.id === item.id)
      if (isSelected) return { ...prev, [subcatId]: current.filter(i => i.id !== item.id) }
      if (maxChoices !== null && maxChoices !== undefined && current.length >= maxChoices) return prev
      return { ...prev, [subcatId]: [...current, item] }
    })
  }

  const handleConfirmSubcat = () => {
    if (!subcatDialog) return
    const allSelected = Object.values(subSelections).flat()
    const extraTotal = allSelected.reduce((sum, i) => sum + i.extra_price, 0)
    const selectedIds = allSelected.map(i => i.id).sort((a, b) => a - b)
    const cartKey = `${subcatDialog.id}_s${selectedIds.join('-')}`
    const nameParts = subcatDialog.subcategories
      .filter(s => (subSelections[s.id] || []).length > 0)
      .map(s => (subSelections[s.id] || []).map(i => i.name).join(', '))
    const displayName = nameParts.length > 0
      ? `${subcatDialog.name} (${nameParts.join(' · ')})`
      : subcatDialog.name
    dispatch(cartAddItem({ ...subcatDialog, cart_key: cartKey, name: displayName, price: subcatDialog.price + extraTotal }))
    setSubcatDialog(null)
  }

  const handleCompleteSale = () => {
    if (!register) return
    if (payMethod === 'JUNAEB' && !junaebCode.trim()) {
      setJunaebCodeError(true)
      return
    }
    const payload = {
      cash_register_id: register.id,
      customer_name: customerName.trim(),
      items: cartItems.map(i => ({
        product_id: i.product_id,
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
      discount: Number(discount || 0),
      payment_method: payMethod,
      amount_received: payMethod === 'CASH' ? Number(amountReceived) : null,
      transaction_code: payMethod === 'JUNAEB' ? junaebCode.trim() : null,
    }
    dispatch(createSale(payload, (err, sale) => {
      if (!err) {
        setSuccessSale(sale)
        dispatch(cartClear())
        setPayDialog(false)
        setAmountReceived('')
        setJunaebCode('')
        setJunaebCodeError(false)
        setDiscount(0)
        setCustomerName('')
        setCustomerNameError(false)
      }
    }))
  }

  if (successSale) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Venta #{successSale.sale_number} realizada con éxito
        </Alert>
        <SaleTicket sale={successSale} autoPrintCopies={1} />
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button variant="contained" fullWidth onClick={() => setSuccessSale(null)}>
            Nueva Venta
          </Button>
          <Button variant="outlined" fullWidth onClick={() => navigate('/ventas')}>
            Ver Ventas
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PointOfSaleIcon /> Nueva Venta
      </Typography>

      {!register && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No tienes una caja abierta. <Button size="small" onClick={() => navigate('/caja')}>Abrir Caja</Button>
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Products Panel */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ pb: '8px !important' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  size="small" placeholder="Buscar producto..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ width: 200 }}
                />
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {activeCategories.map(c => (
                    <Chip
                      key={c} label={c} size="small"
                      color={category === c ? 'primary' : 'default'}
                      onClick={() => setCategory(c)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={1.5}>
              {filteredProducts.map(product => (
                <Grid item xs={6} sm={4} lg={3} key={product.id}>
                  <Card
                    sx={{
                      cursor: product.is_out_of_stock ? 'not-allowed' : 'pointer',
                      opacity: product.is_out_of_stock ? 0.5 : 1,
                      transition: 'transform 0.1s, box-shadow 0.1s',
                      '&:hover': !product.is_out_of_stock ? { transform: 'scale(1.02)', boxShadow: 4 } : {}
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                      <Typography fontSize={28} lineHeight={1}>🍔</Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>{product.name}</Typography>
                      <Typography variant="body2" color="primary.main" fontWeight={700}>{fmt(product.price)}</Typography>
                      <Typography variant="caption" color="text.secondary">{product.category}</Typography>
                      {product.subcategories?.some(s => s.items?.length > 0) && (
                        <Chip label={`${product.subcategories.filter(s => s.items?.length > 0).length} grupos`} size="small" color="info"
                          sx={{ mt: 0.5, display: 'block', height: 18, fontSize: '0.65rem' }} />
                      )}
                      {product.is_out_of_stock && (
                        <Chip label="Sin stock" size="small" color="error" sx={{ mt: 0.5, display: 'block' }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {filteredProducts.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No se encontraron productos
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>

        {/* Cart Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Badge badgeContent={cartItems.reduce((a, i) => a + i.quantity, 0)} color="error">
                  <ShoppingCartIcon />
                </Badge>
                Carrito
              </Typography>

              <TextField
                fullWidth size="small" label="Nombre cliente *"
                required error={customerNameError}
                helperText={customerNameError ? 'El nombre del cliente es obligatorio' : ''}
                value={customerName}
                onChange={e => { setCustomerName(e.target.value); if (e.target.value.trim()) setCustomerNameError(false) }}
                sx={{ mb: 2 }}
              />

              {cartItems.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Agrega productos al carrito
                </Typography>
              ) : (
                <>
                  {cartItems.map(item => (
                    <Box key={item.cart_key} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{item.name}</Typography>
                        <Tooltip title="Quitar">
                          <IconButton size="small" color="error" onClick={() => dispatch(cartRemoveItem(item.cart_key))}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => dispatch(cartUpdateQty(item.cart_key, item.quantity - 1))}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => dispatch(cartUpdateQty(item.cart_key, item.quantity + 1))}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
                          {fmt(item.quantity * item.unit_price)}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}

                  <TextField
                    fullWidth size="small" label="Descuento ($)" type="number"
                    value={discount} onChange={e => setDiscount(e.target.value)}
                    sx={{ mt: 1, mb: 2 }} inputProps={{ min: 0 }}
                  />

                  <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal</Typography>
                      <Typography variant="body2">{fmt(subtotal)}</Typography>
                    </Box>
                    {discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="success.main">Descuento</Typography>
                        <Typography variant="body2" color="success.main">-{fmt(discount)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={700}>TOTAL</Typography>
                      <Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(total)}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="error" size="small" onClick={() => dispatch(cartClear())} fullWidth>
                      Limpiar
                    </Button>
                    <Button
                      variant="contained" size="small" fullWidth
                      onClick={() => {
                        if (!customerName.trim()) { setCustomerNameError(true); return }
                        setPayDialog(true)
                      }}
                      disabled={!register || cartItems.length === 0}
                    >
                      Cobrar
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Subcategory Groups Selection Dialog */}
      <Dialog open={!!subcatDialog} onClose={() => setSubcatDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>{subcatDialog?.name}</DialogTitle>
        <DialogContent>
          {subcatDialog?.subcategories?.filter(s => s.items?.length > 0).map(sub => {
            const selected = subSelections[sub.id] || []
            const atMax = sub.max_choices !== null && sub.max_choices !== undefined && selected.length >= sub.max_choices
            return (
              <Box key={sub.id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{sub.name}</Typography>
                  <Chip
                    size="small"
                    label={sub.max_choices === null ? 'Elección libre' : `Elige hasta ${sub.max_choices}`}
                    color={sub.max_choices === null ? 'success' : 'info'}
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                  <Typography variant="caption" color={atMax ? 'warning.main' : 'text.secondary'} sx={{ ml: 'auto' }}>
                    {selected.length}{sub.max_choices !== null ? `/${sub.max_choices}` : ''} seleccionado{selected.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {sub.items.map(item => {
                    const isSelected = selected.some(i => i.id === item.id)
                    const disabled = !isSelected && atMax
                    return (
                      <Box
                        key={item.id}
                        onClick={() => !disabled && toggleSubItem(sub.id, item, sub.max_choices)}
                        sx={{
                          px: 2, py: 1.25, borderRadius: 2, cursor: disabled ? 'not-allowed' : 'pointer',
                          border: '2px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'primary.50' : disabled ? 'grey.50' : 'transparent',
                          opacity: disabled ? 0.45 : 1,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'all 0.12s',
                        }}
                      >
                        <Typography fontWeight={isSelected ? 700 : 400}>{item.name}</Typography>
                        <Typography variant="body2" color={isSelected ? 'primary.main' : 'text.secondary'} fontWeight={isSelected ? 700 : 400}>
                          {item.extra_price > 0 ? `+${fmt(item.extra_price)}` : 'Incluido'}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            )
          })}
          {(() => {
            const extraTotal = Object.values(subSelections).flat().reduce((s, i) => s + i.extra_price, 0)
            if (extraTotal === 0) return null
            return (
              <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Adicional seleccionado</Typography>
                <Typography variant="body2" color="primary.main" fontWeight={700}>+{fmt(extraTotal)}</Typography>
              </Box>
            )
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubcatDialog(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmSubcat}>
            Agregar — {fmt((subcatDialog?.price || 0) + Object.values(subSelections).flat().reduce((s, i) => s + i.extra_price, 0))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={payDialog} onClose={() => setPayDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Pago</DialogTitle>
        <DialogContent>
          {saleError && <Alert severity="error" sx={{ mb: 2 }}>{saleError}</Alert>}
          <Box sx={{ py: 1 }}>
            <Typography variant="h5" color="primary.main" fontWeight={700} sx={{ mb: 2 }}>
              Total: {fmt(total)}
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Método de pago</InputLabel>
              <Select
                value={payMethod}
                onChange={e => { setPayMethod(e.target.value); setJunaebCode(''); setJunaebCodeError(false) }}
                label="Método de pago"
              >
                {PAY_METHODS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </Select>
            </FormControl>
            {payMethod === 'JUNAEB' && (
              <TextField
                fullWidth label="Código de transacción JUNAEB *" required
                error={junaebCodeError}
                helperText={junaebCodeError ? 'El código de transacción es obligatorio' : ''}
                value={junaebCode}
                onChange={e => { setJunaebCode(e.target.value); if (e.target.value.trim()) setJunaebCodeError(false) }}
                sx={{ mb: 2 }}
              />
            )}
            {payMethod === 'CASH' && (
              <TextField
                fullWidth label="Monto recibido" type="number"
                value={amountReceived} onChange={e => setAmountReceived(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                sx={{ mb: 1 }}
              />
            )}
            {payMethod === 'CASH' && amountReceived && change >= 0 && (
              <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1 }}>
                <Typography fontWeight={700} color="success.dark">
                  Vuelto: {fmt(change)}
                </Typography>
              </Box>
            )}
            {payMethod === 'CASH' && amountReceived && change < 0 && (
              <Alert severity="error">Monto insuficiente ({fmt(Math.abs(change))} de diferencia)</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog(false)}>Cancelar</Button>
          <Button
            variant="contained" onClick={handleCompleteSale}
            disabled={
              creating ||
              (payMethod === 'CASH' && (!amountReceived || change < 0))
            }
          >
            {creating ? <CircularProgress size={20} /> : 'Confirmar Venta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
