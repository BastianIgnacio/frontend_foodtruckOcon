import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, CircularProgress, Alert, Divider, IconButton, Tooltip,
  Table, TableBody, TableCell, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, ToggleButtonGroup,
  ToggleButton, Badge
} from '@mui/material'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import PaymentsIcon from '@mui/icons-material/Payments'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import SchoolIcon from '@mui/icons-material/School'
import CancelIcon from '@mui/icons-material/Cancel'
import RefreshIcon from '@mui/icons-material/Refresh'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import PersonIcon from '@mui/icons-material/Person'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPendingOrders, processPayment, deletePendingOrder } from '../store/pendingOrders/actions'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

const PAYMENT_METHODS = [
  { value: 'CASH',     label: 'Efectivo',     icon: <PaymentsIcon /> },
  { value: 'CARD',     label: 'Tarjeta',       icon: <CreditCardIcon /> },
  { value: 'TRANSFER', label: 'Transferencia', icon: <AccountBalanceIcon /> },
  { value: 'JUNAEB',   label: 'JUNAEB',        icon: <SchoolIcon /> },
]

function TimeAgo({ date }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
      if (diff < 60) setLabel(`${diff}s`)
      else if (diff < 3600) setLabel(`${Math.floor(diff / 60)}min`)
      else setLabel(`${Math.floor(diff / 3600)}h`)
    }
    update()
    const t = setInterval(update, 10000)
    return () => clearInterval(t)
  }, [date])

  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const urgent = diff > 300

  return (
    <Typography
      variant="caption" fontWeight={700}
      color={urgent ? 'error.main' : 'text.secondary'}
      sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
    >
      {urgent && <FiberManualRecordIcon sx={{ fontSize: 8, color: 'error.main' }} />}
      hace {label}
    </Typography>
  )
}

function PaymentDialog({ order, open, onClose, onConfirm, hasRegister }) {
  const [method, setMethod] = useState('CASH')
  const [amountReceived, setAmountReceived] = useState('')
  const [junaebCode, setJunaebCode] = useState('')
  const [junaebCodeError, setJunaebCodeError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setMethod('CASH')
      setAmountReceived('')
      setJunaebCode('')
      setJunaebCodeError(false)
      setError('')
      setProcessing(false)
    }
  }, [open])

  const change = method === 'CASH' && amountReceived
    ? parseFloat(amountReceived) - (order?.total || 0)
    : null

  const handleConfirm = () => {
    if (!hasRegister) { setError('No hay caja abierta. Abre la caja primero.'); return }
    if (method === 'CASH') {
      const amt = parseFloat(amountReceived)
      if (!amountReceived || isNaN(amt) || amt < order.total) {
        setError('El monto recibido debe ser mayor o igual al total')
        return
      }
    }
    if (method === 'JUNAEB' && !junaebCode.trim()) {
      setJunaebCodeError(true)
      return
    }
    setError('')
    setProcessing(true)
    const payload = { payment_method: method }
    if (method === 'CASH') payload.amount_received = parseFloat(amountReceived)
    if (method === 'JUNAEB') payload.transaction_code = junaebCode.trim()
    onConfirm(order.id, payload, (err) => {
      setProcessing(false)
      if (err) setError(err)
      else onClose()
    })
  }

  if (!order) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorefrontIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Procesar Pago
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pedido #{String(order.order_number).padStart(4, '0')} — {order.customer_name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {!hasRegister && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes una caja abierta. Ve a Caja para abrirla antes de procesar pagos.
          </Alert>
        )}

        {/* Items summary */}
        <Table size="small" sx={{ mb: 2, '& td': { py: 0.4, px: 0, border: 'none', fontSize: 13 } }}>
          <TableBody>
            {order.items.map(item => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 28 }}>x{item.quantity}</TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell align="right">{fmt(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
          <Typography fontWeight={700} color="primary.main">TOTAL A PAGAR</Typography>
          <Typography variant="h5" fontWeight={900} color="primary.main">{fmt(order.total)}</Typography>
        </Box>

        <Typography variant="body2" fontWeight={600} gutterBottom>Método de pago</Typography>
        <ToggleButtonGroup
          value={method} exclusive
          onChange={(_, v) => { if (v) { setMethod(v); setAmountReceived(''); setJunaebCode(''); setJunaebCodeError(false); setError('') } }}
          fullWidth sx={{ mb: 2 }}
        >
          {PAYMENT_METHODS.map(m => (
            <ToggleButton key={m.value} value={m.value} sx={{ flex: 1, gap: 0.5, fontSize: 12, fontWeight: 600 }}>
              {m.icon} {m.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {method === 'JUNAEB' && (
          <TextField
            fullWidth label="Código de transacción JUNAEB *" size="small" required
            error={junaebCodeError}
            helperText={junaebCodeError ? 'El código de transacción es obligatorio' : ''}
            value={junaebCode}
            onChange={e => { setJunaebCode(e.target.value); if (e.target.value.trim()) setJunaebCodeError(false) }}
            sx={{ mb: 2 }}
          />
        )}

        {method === 'CASH' && (
          <TextField
            fullWidth label="Monto recibido" type="number" size="small"
            value={amountReceived}
            onChange={e => { setAmountReceived(e.target.value); setError('') }}
            InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>$</Typography> }}
            sx={{ mb: change !== null && change >= 0 ? 1.5 : 0 }}
          />
        )}

        {method === 'CASH' && change !== null && change >= 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
            <Typography variant="body2" fontWeight={600} color="success.dark">Vuelto</Typography>
            <Typography variant="h6" fontWeight={800} color="success.dark">{fmt(change)}</Typography>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} disabled={processing}>Cancelar</Button>
        <Button
          variant="contained" onClick={handleConfirm} disabled={processing || !hasRegister}
          startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <PaymentsIcon />}
          sx={{ fontWeight: 700 }}
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function PendingCard({ order, onPayment, onDelete }) {
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = () => {
    setCancelling(true)
    onDelete(order.id, (err) => {
      setCancelling(false)
      if (err) alert(err)
    })
  }

  return (
    <Card
      elevation={3}
      sx={{
        border: '2px solid',
        borderColor: 'warning.main',
        bgcolor: '#fffde7',
        transition: 'all 0.3s',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} fontFamily="monospace">
              #{String(order.order_number).padStart(4, '0')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight={600}>{order.customer_name}</Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip label="Pago Pendiente" color="warning" size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
            <br />
            <TimeAgo date={order.created_at} />
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Table size="small" sx={{ '& td': { py: 0.3, px: 0, border: 'none', fontSize: 13 } }}>
          <TableBody>
            {order.items.map(item => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 28 }}>x{item.quantity}</TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>{fmt(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ mt: 1, mb: 0.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(order.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="h6" fontWeight={800} color="primary.main">{fmt(order.total)}</Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 1.5, pb: 1.5, pt: 0, gap: 1 }}>
        <Button
          variant="contained" color="success" fullWidth
          startIcon={<PaymentsIcon />}
          onClick={() => onPayment(order)}
          sx={{ fontWeight: 700 }}
        >
          Procesar Pago
        </Button>
        <Tooltip title="Cancelar y eliminar pedido">
          <IconButton size="small" color="error" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? <CircularProgress size={16} /> : <CancelIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  )
}

export default function VentasPendientesPage() {
  const dispatch = useDispatch()
  const { list: orders, loading, error } = useSelector(s => s.pendingOrders)
  const { current: register } = useSelector(s => s.cashRegister)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [snack, setSnack] = useState(null)

  const load = () => dispatch(fetchPendingOrders())
  useEffect(() => { load() }, [])

  const pendingPayment = orders.filter(o => o.status === 'PENDING_PAYMENT')
  const hasRegister = register?.status === 'OPEN'

  const handleConfirmPayment = (id, data, cb) => {
    dispatch(processPayment(id, data, (err, order) => {
      if (!err) setSnack(`Pago procesado — Pedido #${String(order.order_number).padStart(4, '0')} enviado a cocina`)
      cb(err)
    }))
  }

  const handleDelete = (id, cb) => {
    dispatch(deletePendingOrder(id, cb))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PendingActionsIcon color="warning" /> Ventas Pendientes
          </Typography>
          {pendingPayment.length > 0 && (
            <Chip
              label={`${pendingPayment.length} por cobrar`}
              color="warning" size="small"
              sx={{ animation: 'pulse 2s infinite', fontWeight: 700 }}
            />
          )}
        </Box>
        <Tooltip title="Actualizar">
          <IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Por cobrar',  value: pendingPayment.length, color: 'warning.main' },
          { label: 'Caja',        value: hasRegister ? 'Abierta' : 'Cerrada', color: hasRegister ? 'success.main' : 'error.main' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card variant="outlined">
              <CardContent sx={{ py: '12px !important', px: 2 }}>
                <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!hasRegister && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No hay caja abierta. Para procesar pagos debes abrir la caja desde la sección <strong>Caja</strong>.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : pendingPayment.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <PendingActionsIcon sx={{ fontSize: 64, opacity: 0.15, mb: 1 }} />
          <Typography variant="h6">No hay ventas pendientes de pago</Typography>
          <Typography variant="body2">Los pedidos de la tienda aparecerán aquí antes de pasar a cocina</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {pendingPayment.map(order => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
              <PendingCard
                order={order}
                onPayment={(o) => setSelectedOrder(o)}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <PaymentDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onConfirm={handleConfirmPayment}
        hasRegister={hasRegister}
      />

      {snack && (
        <Box sx={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          bgcolor: 'success.main', color: 'white', px: 3, py: 1.5,
          borderRadius: 2, boxShadow: 6, zIndex: 9999, fontWeight: 600, fontSize: 14
        }}>
          {snack}
          <IconButton size="small" sx={{ color: 'white', ml: 1 }} onClick={() => setSnack(null)}>
            <CancelIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}
