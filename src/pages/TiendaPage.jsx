import { useEffect, useState } from 'react'
import axios from 'axios'
import { createPendingOrderApi } from '../api'
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, TextField, InputAdornment, CircularProgress, Badge, Drawer,
  IconButton, Divider, AppBar, Toolbar, List, ListItem, ListItemText,
  ListItemSecondaryAction, Snackbar, Alert, useMediaQuery, useTheme,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

const CATEGORY_EMOJIS = {
  'Hot Dogs': '🌭',
  'Hamburguesas': '🍔',
  'Acompañamientos': '🍟',
  'Bebidas': '🥤',
  'General': '🍽️',
  'Otro': '🥘',
}

export default function TiendaPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [snack, setSnack] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerNameError, setCustomerNameError] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [subcatDialog, setSubcatDialog] = useState(null)
  const [subSelections, setSubSelections] = useState({})

  useEffect(() => {
    axios.get('/api/products/public')
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['Todos', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    if (activeCategory !== 'Todos' && p.category !== activeCategory) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0)
  const cartTotal = cart.reduce((a, i) => a + i.quantity * i.price, 0)

  const addToCart = (product, cartKey, displayName, price) => {
    const key = cartKey || `${product.id}`
    const name = displayName || product.name
    const itemPrice = price !== undefined ? price : product.price
    setCart(prev => {
      const exists = prev.find(i => i.id === key)
      if (exists) return prev.map(i => i.id === key ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { id: key, product_id: product.id, name, price: itemPrice, quantity: 1 }]
    })
    setSnack(`${name} agregado al carrito`)
  }

  const handleAddToCart = (product) => {
    const hasSubcats = product.subcategories?.some(s => s.items?.length > 0)
    if (hasSubcats) {
      setSubcatDialog(product)
      setSubSelections({})
    } else {
      addToCart(product)
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
    addToCart(subcatDialog, cartKey, displayName, subcatDialog.price + extraTotal)
    setSubcatDialog(null)
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id)
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setCart([])

  const getQty = (product) => {
    if (product.subcategories?.some(s => s.items?.length > 0)) {
      return cart.filter(i => i.product_id === product.id).reduce((a, i) => a + i.quantity, 0)
    }
    return cart.find(i => i.id === `${product.id}`)?.quantity || 0
  }

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      setCustomerNameError(true)
      return
    }
    setCustomerNameError(false)
    setOrdering(true)
    try {
      const payload = {
        customer_name: customerName.trim(),
        items: cart.map(i => ({
          product_id: i.product_id,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
        }))
      }
      const { data } = await createPendingOrderApi(payload)
      setOrderSuccess(data)
      clearCart()
      setCustomerName('')
      setCartOpen(false)
      setShowThankYou(true)
      setTimeout(() => {
        setShowThankYou(false)
        setOrderSuccess(null)
      }, 5000)
    } catch (err) {
      setSnack('Error al enviar el pedido. Intenta nuevamente.')
    } finally {
      setOrdering(false)
    }
  }

  const CartPanel = (
    <Box sx={{ width: isMobile ? '100vw' : 380, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>
          <ShoppingCartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Mi Carrito
        </Typography>
        <IconButton color="inherit" onClick={() => setCartOpen(false)}><CloseIcon /></IconButton>
      </Box>

      {cart.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, color: 'text.secondary' }}>
          <ShoppingCartIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
          <Typography>Tu carrito está vacío</Typography>
          <Typography variant="caption">Agrega productos desde el menú</Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {cart.map(item => (
              <Box key={item.id}>
                <ListItem sx={{ px: 1, py: 1.5 }}>
                  <ListItemText
                    primary={<Typography fontWeight={600} fontSize={14}>{item.name}</Typography>}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', p: 0.3 }}
                          onClick={() => updateQty(item.id, item.quantity - 1)}>
                          <RemoveIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <Typography fontWeight={700} fontSize={15} sx={{ minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', p: 0.3 }}
                          onClick={() => updateQty(item.id, item.quantity + 1)}>
                          <AddIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ ml: 1 }}>
                          {fmt(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {orderSuccess ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={700} color="success.main">
                  ¡Pedido #{String(orderSuccess.order_number).padStart(4,'0')} enviado!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  El personal preparará tu pedido. Preséntate en el mostrador.
                </Typography>
                <Button variant="outlined" fullWidth onClick={() => { setOrderSuccess(null); setCustomerNameError(false) }}>
                  Hacer otro pedido
                </Button>
              </Box>
            ) : (
              <>
                <TextField
                  fullWidth size="small" label="Tu nombre" placeholder="Ingresa tu nombre"
                  required error={customerNameError}
                  helperText={customerNameError ? 'El nombre es obligatorio' : ''}
                  value={customerName}
                  onChange={e => { setCustomerName(e.target.value); if (e.target.value.trim()) setCustomerNameError(false) }}
                  sx={{ mb: 1.5 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">{cartCount} producto(s)</Typography>
                  <Button size="small" color="error" onClick={clearCart} disabled={ordering}>Limpiar</Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">{fmt(cartTotal)}</Typography>
                </Box>
                <Button
                  variant="contained" fullWidth size="large" onClick={handleConfirmOrder}
                  disabled={ordering || cart.length === 0}
                  sx={{ borderRadius: 3, py: 1.5, fontSize: 16, fontWeight: 700 }}
                >
                  {ordering ? <CircularProgress size={22} color="inherit" /> : 'Confirmar Pedido'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Preséntate en el mostrador para pagar
                </Typography>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <FastfoodIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ flexGrow: 1 }}>
            FoodTruck — Tienda
          </Typography>
          <TextField
            size="small" placeholder="Buscar..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: { xs: 130, sm: 220 } }}
          />
          <Tooltip title="Ver carrito">
            <IconButton
              onClick={() => setCartOpen(true)}
              sx={{ bgcolor: cartCount > 0 ? 'primary.main' : 'grey.100', color: cartCount > 0 ? 'white' : 'text.primary',
                '&:hover': { bgcolor: cartCount > 0 ? 'primary.dark' : 'grey.200' } }}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Categories */}
        <Box sx={{ px: 2, pb: 1.5, display: 'flex', gap: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat === 'Todos' ? '🍽️ Todos' : `${CATEGORY_EMOJIS[cat] || '🍽️'} ${cat}`}
              onClick={() => setActiveCategory(cat)}
              color={activeCategory === cat ? 'primary' : 'default'}
              variant={activeCategory === cat ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer', fontWeight: activeCategory === cat ? 700 : 400, flexShrink: 0 }}
            />
          ))}
        </Box>
      </AppBar>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress size={48} /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">No se encontraron productos</Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map(product => {
              const qty = getQty(product)
              const hasSubcats = product.subcategories?.some(s => s.items?.length > 0)
              const hasOptions = hasSubcats
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                  }}>
                    {product.image_url ? (
                      <Box sx={{ height: 140, overflow: 'hidden' }}>
                        <img
                          src={product.image_url} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{
                        height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 72, lineHeight: 1,
                        background: 'linear-gradient(135deg, #fff8f0 0%, #ffe0cc 100%)'
                      }}>
                        {CATEGORY_EMOJIS[product.category] || '🍽️'}
                      </Box>
                    )}
                    <CardContent sx={{ flex: 1, pb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom>{product.name}</Typography>
                      {product.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 12 }}>
                          {product.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                        <Typography variant="h6" fontWeight={800} color="primary.main">{fmt(product.price)}</Typography>
                        <Chip label={product.category} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                      </Box>
                      {hasSubcats && (
                        <Typography variant="caption" color="info.main" sx={{ fontSize: 11 }}>
                          {(product.subcategories || []).filter(s => s.items?.length > 0).length} grupo{(product.subcategories || []).filter(s => s.items?.length > 0).length !== 1 ? 's' : ''} de opciones
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 1.5, pt: 0 }}>
                      {hasOptions || qty === 0 ? (
                        <Button
                          fullWidth variant="contained" startIcon={<AddShoppingCartIcon />}
                          onClick={() => handleAddToCart(product)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Agregar{hasOptions && qty > 0 ? ` (${qty} en carrito)` : ''}
                        </Button>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                          <IconButton size="small" onClick={() => updateQty(`${product.id}`, qty - 1)}
                            sx={{ border: '2px solid', borderColor: 'primary.main', color: 'primary.main', p: 0.5 }}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography fontWeight={800} fontSize={18} color="primary.main">{qty}</Typography>
                          <IconButton size="small" onClick={() => updateQty(`${product.id}`, qty + 1)}
                            sx={{ border: '2px solid', borderColor: 'primary.main', color: 'primary.main', p: 0.5 }}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ ml: 'auto' }}>
                            {fmt(product.price * qty)}
                          </Typography>
                        </Box>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>

      {/* Floating cart button on mobile */}
      {cartCount > 0 && (
        <Box sx={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: { md: 'none' }, zIndex: 1000
        }}>
          <Button
            variant="contained" size="large" onClick={() => setCartOpen(true)}
            startIcon={<Badge badgeContent={cartCount} color="error"><ShoppingCartIcon /></Badge>}
            sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 700, boxShadow: 6, fontSize: 15 }}
          >
            Ver Carrito · {fmt(cartTotal)}
          </Button>
        </Box>
      )}

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px 0 0 16px' } }}>
        {CartPanel}
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={!!snack} autoHideDuration={2000} onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" onClose={() => setSnack(null)} sx={{ fontWeight: 600 }}>
          {snack}
        </Alert>
      </Snackbar>

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
                        <Typography fontWeight={isSelected ? 700 : 400} color={disabled ? 'text.disabled' : 'text.primary'}>
                          {item.name}
                        </Typography>
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
          {/* Extra total */}
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

      {/* Thank you popup */}
      <Dialog
        open={showThankYou}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        onClose={() => {}}
        PaperProps={{
          sx: {
            borderRadius: 4,
            textAlign: 'center',
            py: 5,
            px: 4,
            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
            boxShadow: 24,
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <CheckCircleIcon sx={{ fontSize: 96, color: 'success.main', mb: 3 }} />
          <Typography variant="h4" fontWeight={800} color="success.dark" gutterBottom>
            ¡Muchas gracias!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Ahora preséntese en el mostrador para pagar
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
