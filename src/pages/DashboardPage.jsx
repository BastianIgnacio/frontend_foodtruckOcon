import { useEffect } from 'react'
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
  Chip, List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSales } from '../store/sales/actions'
import { fetchProducts } from '../store/products/actions'
import { fetchCurrentRegister } from '../store/cashRegister/actions'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

function StatCard({ title, value, icon, color = 'primary.main', subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ color, opacity: 0.2, fontSize: 48 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { list: sales, loading: salesLoading } = useSelector(s => s.sales)
  const { list: products } = useSelector(s => s.products)
  const { current: register } = useSelector(s => s.cashRegister)
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    if (user?.role !== 'CLIENTE') {
      dispatch(fetchSales({ limit: 20 }))
      dispatch(fetchProducts())
    }
  }, [dispatch, user])

  const todaySales = sales.filter(s => {
    const d = new Date(s.created_at)
    const today = new Date()
    return d.toDateString() === today.toDateString() && s.status === 'COMPLETED'
  })

  const todayTotal = todaySales.reduce((acc, s) => acc + s.total, 0)
  const outOfStock = products.filter(p => p.is_out_of_stock && p.is_active)

  if (user?.role === 'CLIENTE') {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Bienvenido, {user?.full_name}</Typography>
        <Typography color="text.secondary">Dirígete al Menú para ver nuestros productos disponibles.</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ventas Hoy" value={todaySales.length}
            icon={<TrendingUpIcon fontSize="inherit" />}
            color="primary.main"
            subtitle={fmt(todayTotal)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Hoy" value={fmt(todayTotal)}
            icon={<LocalAtmIcon fontSize="inherit" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Productos Activos" value={products.filter(p => p.is_active).length}
            icon={<FastfoodIcon fontSize="inherit" />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sin Stock" value={outOfStock.length}
            icon={<WarningAmberIcon fontSize="inherit" />}
            color={outOfStock.length > 0 ? 'warning.main' : 'success.main'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Caja actual */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Estado de Caja</Typography>
              {register ? (
                <Box>
                  <Chip label="ABIERTA" color="success" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2">Apertura: {fmt(register.opening_amount)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Abierta: {new Date(register.opened_at).toLocaleString('es-CL')}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Chip label="CERRADA" color="error" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay caja abierta. Abre la caja para realizar ventas.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Últimas ventas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Últimas Ventas</Typography>
              {salesLoading ? (
                <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={24} /></Box>
              ) : (
                <List dense disablePadding>
                  {sales.slice(0, 8).map((sale, i) => (
                    <Box key={sale.id}>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`#${String(sale.sale_number).padStart(4,'0')} — ${sale.customer_name || 'Sin nombre'}`}
                          secondary={new Date(sale.created_at).toLocaleString('es-CL')}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight={600}>{fmt(sale.total)}</Typography>
                            <Chip
                              label={sale.status === 'COMPLETED' ? 'OK' : 'CANCEL'}
                              color={sale.status === 'COMPLETED' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {i < 7 && <Divider />}
                    </Box>
                  ))}
                  {sales.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No hay ventas registradas
                    </Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sin stock */}
        {outOfStock.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ border: '1px solid', borderColor: 'warning.main' }}>
              <CardContent>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  <WarningAmberIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Productos Sin Stock
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {outOfStock.map(p => (
                    <Chip key={p.id} label={p.name} color="warning" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
