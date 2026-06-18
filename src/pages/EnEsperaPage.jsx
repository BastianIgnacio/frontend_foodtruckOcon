import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, CircularProgress, Alert, Divider, IconButton, Tooltip,
  Tabs, Tab, Badge, Table, TableBody, TableCell, TableRow,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import RefreshIcon from '@mui/icons-material/Refresh'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPendingOrders, updateOrderStatus } from '../store/pendingOrders/actions'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

const STATUS_CONFIG = {
  WAITING:  { label: 'En Espera',   color: 'warning', bg: '#fff8e1' },
  READY:    { label: 'En Preparación', color: 'info',    bg: '#e3f2fd' },
  ATTENDED: { label: 'Atendido',    color: 'success', bg: '#e8f5e9' },
  CANCELLED:{ label: 'Cancelado',   color: 'error',   bg: '#ffebee' },
}

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
      variant="caption"
      fontWeight={700}
      color={urgent ? 'error.main' : 'text.secondary'}
      sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
    >
      {urgent && <FiberManualRecordIcon sx={{ fontSize: 8, color: 'error.main' }} />}
      hace {label}
    </Typography>
  )
}

function OrderCard({ order, onStatusChange }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.WAITING
  const [updating, setUpdating] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const change = (status) => {
    setUpdating(true)
    onStatusChange(order.id, status, () => setUpdating(false))
  }

  return (
    <Card
      elevation={order.status === 'WAITING' ? 4 : 1}
      sx={{
        bgcolor: cfg.bg,
        border: '2px solid',
        borderColor: order.status === 'WAITING' ? 'warning.main' : 'transparent',
        transition: 'all 0.3s',
        opacity: ['ATTENDED', 'CANCELLED'].includes(order.status) ? 0.75 : 1,
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="h6" fontWeight={800} fontFamily="monospace">
                #{String(order.order_number).padStart(4, '0')}
              </Typography>
              <Tooltip title={order.notes?.startsWith('Venta') ? 'Desde Nueva Venta' : 'Desde Tienda'}>
                {order.notes?.startsWith('Venta')
                  ? <PointOfSaleIcon sx={{ fontSize: 16, color: 'secondary.main', opacity: 0.7 }} />
                  : <StorefrontIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.7 }} />
                }
              </Tooltip>
            </Box>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {order.customer_name || 'Cliente anónimo'}
            </Typography>
            {order.notes && (
              <Typography variant="caption" color="text.secondary">{order.notes}</Typography>
            )}
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
            <br />
            <TimeAgo date={order.created_at} />
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Items */}
        <Table size="small" sx={{ '& td': { py: 0.3, px: 0, border: 'none', fontSize: 13 } }}>
          <TableBody>
            {order.items.map(item => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 28 }}>
                  x{item.quantity}
                </TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {fmt(item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ mt: 1, mb: 0.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(order.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {fmt(order.total)}
          </Typography>
        </Box>
      </CardContent>

      {/* Actions */}
      {!['ATTENDED', 'CANCELLED'].includes(order.status) && (
        <CardActions sx={{ px: 1.5, pb: 1.5, pt: 0, gap: 1 }}>
          {order.status === 'WAITING' && (
            <Button
              size="small" variant="contained" color="info" fullWidth
              startIcon={updating ? <CircularProgress size={14} color="inherit" /> : <HourglassTopIcon />}
              onClick={() => change('READY')} disabled={updating}
              sx={{ fontWeight: 700 }}
            >
              En Preparación
            </Button>
          )}
          {order.status === 'READY' && (
            <Button
              size="small" variant="contained" color="success" fullWidth
              startIcon={updating ? <CircularProgress size={14} color="inherit" /> : <DoneAllIcon />}
              onClick={() => change('ATTENDED')} disabled={updating}
              sx={{ fontWeight: 700 }}
            >
              Entregado
            </Button>
          )}
          <Tooltip title="Cancelar pedido">
            <IconButton size="small" color="error" onClick={() => setConfirmCancel(true)} disabled={updating}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}

      <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancelar pedido</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cancelar el pedido{' '}
            <strong>#{String(order.order_number).padStart(4, '0')}</strong>
            {order.customer_name ? ` de ${order.customer_name}` : ''}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(false)}>Volver</Button>
          <Button
            variant="contained" color="error"
            onClick={() => { setConfirmCancel(false); change('CANCELLED') }}
          >
            Cancelar pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

const TAB_FILTERS = [
  { label: 'Activos',   statuses: ['WAITING', 'READY'] },
  { label: 'En Espera', statuses: ['WAITING'] },
  { label: 'Preparación', statuses: ['READY'] },
  { label: 'Atendidos', statuses: ['ATTENDED'] },
  { label: 'Todos',     statuses: null },
]

export default function EnEsperaPage() {
  const dispatch = useDispatch()
  const { list: orders, loading, error } = useSelector(s => s.pendingOrders)
  const [tab, setTab] = useState(0)

  const load = () => dispatch(fetchPendingOrders())

  useEffect(() => { load() }, [])

  const handleStatusChange = (id, status, done) => {
    dispatch(updateOrderStatus(id, status, (err) => { done(); if (err) alert(err) }))
  }

  // Exclude PENDING_PAYMENT orders — those belong in "Ventas Pendientes"
  const kitchenOrders = orders.filter(o => o.status !== 'PENDING_PAYMENT')

  const filter = TAB_FILTERS[tab]
  const displayed = filter.statuses
    ? kitchenOrders.filter(o => filter.statuses.includes(o.status))
    : kitchenOrders

  const waitingCount   = kitchenOrders.filter(o => o.status === 'WAITING').length
  const readyCount     = kitchenOrders.filter(o => o.status === 'READY').length
  const attendedToday  = kitchenOrders.filter(o => {
    if (o.status !== 'ATTENDED') return false
    const ref = o.attended_at || o.created_at
    return new Date(ref).toDateString() === new Date().toDateString()
  }).length

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HourglassTopIcon color="warning" /> Pedidos en Espera
          </Typography>
          {waitingCount > 0 && (
            <Chip
              label={`${waitingCount} esperando`}
              color="warning" size="small" fontWeight={700}
              sx={{ animation: 'pulse 2s infinite', fontWeight: 700 }}
            />
          )}
        </Box>
        <Tooltip title="Actualizar">
          <IconButton onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'En espera',     value: waitingCount,  color: 'warning.main' },
          { label: 'En preparación', value: readyCount,    color: 'info.main' },
          { label: 'Atendidos hoy', value: attendedToday, color: 'success.main' },
          { label: 'Total hoy',     value: kitchenOrders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, color: 'text.primary' },
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {TAB_FILTERS.map((f, i) => {
          const count = f.statuses ? kitchenOrders.filter(o => f.statuses.includes(o.status)).length : kitchenOrders.length
          return (
            <Tab
              key={f.label}
              label={
                <Badge badgeContent={count || null} color={i === 0 && count > 0 ? 'warning' : 'default'}>
                  <Typography variant="body2" fontWeight={tab === i ? 700 : 400} sx={{ pr: count ? 1.5 : 0 }}>
                    {f.label}
                  </Typography>
                </Badge>
              }
            />
          )
        })}
      </Tabs>

      {/* Orders */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : displayed.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <HourglassTopIcon sx={{ fontSize: 64, opacity: 0.15, mb: 1 }} />
          <Typography variant="h6">No hay pedidos {filter.label.toLowerCase()}</Typography>
          <Typography variant="body2">Los pedidos de la tienda aparecerán aquí en tiempo real</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {displayed.map(order => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
              <OrderCard order={order} onStatusChange={handleStatusChange} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
