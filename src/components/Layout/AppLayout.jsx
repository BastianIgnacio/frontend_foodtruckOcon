import { useState, useEffect } from 'react'
import { Box, Toolbar, useMediaQuery, useTheme, Snackbar, Alert } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Header from './Header'
import Sidebar from './Sidebar'
import { fetchCurrentRegister } from '../../store/cashRegister/actions'
import { wsOrderUpdated, wsOrderDeleted, fetchPendingOrders } from '../../store/pendingOrders/actions'

const DRAWER_WIDTH = 240

export default function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [wsMessage, setWsMessage] = useState(null)

  useEffect(() => {
    dispatch(fetchCurrentRegister())
    dispatch(fetchPendingOrders())
  }, [dispatch])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    let ws = null
    let pingInterval = null
    let reconnectTimeout = null
    let active = true

    const connect = () => {
      if (!active) return
      const wsBase = import.meta.env.VITE_WS_URL || `ws://${window.location.host}`
      ws = new WebSocket(`${wsBase}/ws?token=${token}`)

      ws.onopen = () => {
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping')
        }, 30000)
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'sale_created')
            setWsMessage(`Nueva venta #${msg.sale?.sale_number} — ${Number(msg.sale?.total).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}`)
          if (msg.type === 'product_stock_changed')
            setWsMessage(`Producto "${msg.product?.name}" ${msg.product?.is_out_of_stock ? 'marcado sin stock' : 'con stock disponible'}`)
          if (msg.type === 'pending_order_created') {
            dispatch(fetchPendingOrders())
            const isPending = msg.order?.status === 'PENDING_PAYMENT'
            const label = isPending ? 'Pedido de tienda — pago pendiente' : 'Pedido en espera'
            setWsMessage(`${label}: #${msg.order?.order_number} de ${msg.order?.customer_name} — ${Number(msg.order?.total).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}`)
          }
          if (msg.type === 'pending_order_updated')
            dispatch(wsOrderUpdated(msg.order))
          if (msg.type === 'pending_order_deleted')
            dispatch(wsOrderDeleted(msg.order?.id))
        } catch {}
      }

      ws.onclose = () => {
        clearInterval(pingInterval)
        if (active) reconnectTimeout = setTimeout(connect, 4000)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      active = false
      clearTimeout(reconnectTimeout)
      clearInterval(pingInterval)
      if (ws && ws.readyState !== WebSocket.CONNECTING) ws.close()
      else if (ws) ws.onopen = () => ws.close()
    }
  }, [])

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuToggle={() => setSidebarOpen(o => !o)} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant={isMobile ? 'temporary' : 'persistent'}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin', { easing: theme.transitions.easing.sharp, duration: 200 }),
          ml: (!isMobile && sidebarOpen) ? `${DRAWER_WIDTH}px` : 0,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      <Snackbar
        open={!!wsMessage}
        autoHideDuration={4000}
        onClose={() => setWsMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setWsMessage(null)}>{wsMessage}</Alert>
      </Snackbar>
    </Box>
  )
}
