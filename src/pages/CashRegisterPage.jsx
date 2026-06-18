import { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Chip, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockIcon from '@mui/icons-material/Lock'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRegisters, fetchCurrentRegister,
  openRegister, closeRegister
} from '../store/cashRegister/actions'
import { fetchSales } from '../store/sales/actions'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

export default function CashRegisterPage() {
  const dispatch = useDispatch()
  const { list: registers, current, loading, error } = useSelector(s => s.cashRegister)
  const { list: sales } = useSelector(s => s.sales)
  const { user } = useSelector(s => s.auth)

  const [openDialog, setOpenDialog] = useState(false)
  const [closeDialog, setCloseDialog] = useState(false)
  const [openAmount, setOpenAmount] = useState('')
  const [closeAmount, setCloseAmount] = useState('')
  const [closeNotes, setCloseNotes] = useState('')
  const [opError, setOpError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchRegisters())
    dispatch(fetchCurrentRegister())
    dispatch(fetchSales({ limit: 200 }))
  }, [dispatch])

  const handleOpen = () => {
    if (!openAmount || Number(openAmount) < 0) { setOpError('Ingresa el monto de apertura'); return }
    setSaving(true)
    dispatch(openRegister({ opening_amount: Number(openAmount) }, (err) => {
      setSaving(false)
      if (err) setOpError(err)
      else { setOpenDialog(false); setOpenAmount(''); setOpError(null) }
    }))
  }

  const handleClose = () => {
    if (!closeAmount || Number(closeAmount) < 0) { setOpError('Ingresa el monto de cierre'); return }
    setSaving(true)
    dispatch(closeRegister(current.id, { closing_amount: Number(closeAmount), notes: closeNotes }, (err) => {
      setSaving(false)
      if (err) setOpError(err)
      else { setCloseDialog(false); setCloseAmount(''); setCloseNotes(''); setOpError(null); dispatch(fetchRegisters()) }
    }))
  }

  const getSalesForRegister = (registerId) =>
    sales.filter(s => s.cash_register_id === registerId && s.status === 'COMPLETED')

  const getRegisterTotal = (registerId) =>
    getSalesForRegister(registerId).reduce((a, s) => a + s.total, 0)

  const getMethodStats = (registerId) => {
    const regSales = getSalesForRegister(registerId)
    const methods = ['CASH', 'CARD', 'TRANSFER', 'JUNAEB']
    return methods.map(m => ({
      method: m,
      count: regSales.filter(s => s.payment_method === m).length,
      total: regSales.filter(s => s.payment_method === m).reduce((a, s) => a + s.total, 0),
    }))
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalAtmIcon /> Gestión de Caja
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Current Register */}
      <Card sx={{ mb: 3, border: '2px solid', borderColor: current ? 'success.main' : 'error.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {current ? <LockOpenIcon color="success" /> : <LockIcon color="error" />}
                <Typography variant="h6">
                  Estado: <Chip label={current ? 'ABIERTA' : 'CERRADA'} color={current ? 'success' : 'error'} size="small" />
                </Typography>
              </Box>
              {current && (
                <Box>
                  <Typography variant="body2">Apertura: <strong>{fmt(current.opening_amount)}</strong></Typography>
                  <Typography variant="body2">
                    Abierta desde: {new Date(current.opened_at).toLocaleString('es-CL')}
                  </Typography>
                  <Typography variant="body2">
                    Ventas del turno: {getSalesForRegister(current.id).length} ({fmt(getRegisterTotal(current.id))})
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!current && (
                <Button variant="contained" color="success" startIcon={<LockOpenIcon />}
                  onClick={() => { setOpError(null); setOpenDialog(true) }}>
                  Abrir Caja
                </Button>
              )}
              {current && (
                <Button variant="contained" color="error" startIcon={<LockIcon />}
                  onClick={() => { setOpError(null); setCloseDialog(true) }}>
                  Cerrar Caja
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Cash Register History */}
      <Typography variant="h6" gutterBottom>
        {user?.role === 'ADMIN' ? 'Historial de Cajas (Todos los Vendedores)' : 'Mi Historial de Cajas'}
      </Typography>
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell>Vendedor</TableCell>
                <TableCell>Apertura</TableCell>
                <TableCell align="right">Monto Apertura</TableCell>
                <TableCell align="right">Ventas en Turno</TableCell>
                <TableCell align="right">Monto Cierre</TableCell>
                <TableCell align="right">Esperado</TableCell>
                <TableCell align="right">Diferencia</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={20} sx={{ m: 2 }} /></TableCell></TableRow>
              )}
              {!loading && registers.map(reg => {
                const regSales = getSalesForRegister(reg.id)
                const regTotal = regSales.reduce((a, s) => a + s.total, 0)
                const diff = reg.difference
                return (
                  <TableRow key={reg.id} hover>
                    <TableCell>{reg.user?.full_name || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(reg.opened_at).toLocaleString('es-CL')}</Typography>
                      {reg.closed_at && (
                        <Typography variant="caption" color="text.secondary">
                          Cierre: {new Date(reg.closed_at).toLocaleString('es-CL')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{fmt(reg.opening_amount)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{regSales.length} ventas</Typography>
                      <Typography variant="body2" fontWeight={600}>{fmt(regTotal)}</Typography>
                    </TableCell>
                    <TableCell align="right">{reg.closing_amount != null ? fmt(reg.closing_amount) : '—'}</TableCell>
                    <TableCell align="right">{reg.expected_amount != null ? fmt(reg.expected_amount) : '—'}</TableCell>
                    <TableCell align="right">
                      {diff != null && (
                        <Typography
                          fontWeight={600}
                          color={Math.abs(diff) < 1 ? 'success.main' : diff > 0 ? 'primary.main' : 'error.main'}
                        >
                          {diff >= 0 ? '+' : ''}{fmt(diff)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reg.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                        color={reg.status === 'OPEN' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              {!loading && registers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>No hay registros de caja</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Open Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Apertura de Caja</DialogTitle>
        <DialogContent>
          {opError && <Alert severity="error" sx={{ mb: 2 }}>{opError}</Alert>}
          <TextField
            fullWidth label="Monto inicial en caja ($)" type="number" margin="normal" autoFocus
            value={openAmount} onChange={e => setOpenAmount(e.target.value)}
            InputProps={{ startAdornment: '$' }} inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleOpen} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Abrir Caja'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={closeDialog} onClose={() => setCloseDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cierre de Caja</DialogTitle>
        <DialogContent>
          {opError && <Alert severity="error" sx={{ mb: 2 }}>{opError}</Alert>}
          {current && (() => {
            const stats = getMethodStats(current.id)
            const totalCount = stats.reduce((a, s) => a + s.count, 0)
            const totalAmount = stats.reduce((a, s) => a + s.total, 0)
            const labels = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', JUNAEB: 'JUNAEB' }
            const highlighted = ['CARD', 'JUNAEB']
            return (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Monto apertura</Typography>
                  <Typography variant="body2" fontWeight={600}>{fmt(current.opening_amount)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                  VENTAS POR MÉTODO DE PAGO
                </Typography>
                {stats.map(({ method, count, total }) => (
                  <Box key={method} sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mt: 0.5,
                    px: highlighted.includes(method) ? 0.8 : 0,
                    py: highlighted.includes(method) ? 0.4 : 0,
                    bgcolor: method === 'CARD' ? 'primary.50' : method === 'JUNAEB' ? 'secondary.50' : 'transparent',
                    borderRadius: 1,
                    border: highlighted.includes(method) ? '1px solid' : 'none',
                    borderColor: method === 'CARD' ? 'primary.200' : 'secondary.200',
                  }}>
                    <Typography variant="body2" fontWeight={highlighted.includes(method) ? 700 : 400}
                      color={method === 'CARD' ? 'primary.main' : method === 'JUNAEB' ? 'secondary.main' : 'text.primary'}>
                      {labels[method]}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({count} {count === 1 ? 'venta' : 'ventas'})
                      </Typography>
                    </Typography>
                    <Typography variant="body2" fontWeight={highlighted.includes(method) ? 700 : 400}
                      color={method === 'CARD' ? 'primary.main' : method === 'JUNAEB' ? 'secondary.main' : 'text.primary'}>
                      {fmt(total)}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={700}>
                    Total turno ({totalCount} {totalCount === 1 ? 'venta' : 'ventas'})
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>{fmt(totalAmount)}</Typography>
                </Box>
              </Box>
            )
          })()}
          <TextField
            fullWidth label="Monto contado en caja ($)" type="number" margin="normal" autoFocus
            value={closeAmount} onChange={e => setCloseAmount(e.target.value)}
            InputProps={{ startAdornment: '$' }} inputProps={{ min: 0 }}
          />
          <TextField
            fullWidth label="Notas (opcional)" multiline rows={2} margin="normal"
            value={closeNotes} onChange={e => setCloseNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleClose} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Cerrar Caja'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
