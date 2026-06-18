import { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, Button, CircularProgress, TextField,
  InputAdornment, Tooltip, Pagination, Stack
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PrintIcon from '@mui/icons-material/Print'
import CancelIcon from '@mui/icons-material/Cancel'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSales, cancelSale } from '../store/sales/actions'
import SaleTicket from '../components/Ticket/SaleTicket'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
const PAY_LABELS = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', JUNAEB: 'JUNAEB' }
const PAGE_SIZE = 15

export default function SalesPage() {
  const dispatch = useDispatch()
  const { list: sales, loading, total } = useSelector(s => s.sales)
  const { user } = useSelector(s => s.auth)

  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [selectedSale, setSelectedSale] = useState(null)
  const [showTicket, setShowTicket] = useState(false)

  useEffect(() => {
    const params = { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    dispatch(fetchSales(params))
  }, [page, dateFrom, dateTo, dispatch])

  const handleDateFrom = (v) => { setDateFrom(v); setPage(1) }
  const handleDateTo = (v) => { setDateTo(v); setPage(1) }
  const clearFilters = () => { setDateFrom(''); setDateTo(''); setSearch(''); setPage(1) }

  const displayed = sales.filter(s =>
    !search ||
    String(s.sale_number).includes(search) ||
    s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.seller?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilters = dateFrom || dateTo

  const handleCancel = (saleId) => {
    if (window.confirm('¿Cancelar esta venta?')) {
      dispatch(cancelSale(saleId))
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h5">Historial de Ventas</Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={dateFrom}
            onChange={e => handleDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={dateTo}
            onChange={e => handleDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          {hasFilters && (
            <Tooltip title="Limpiar filtros">
              <IconButton size="small" onClick={clearFilters} color="default">
                <FilterAltOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <TextField
            size="small" placeholder="Buscar en página..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: 200 }}
          />
        </Box>
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell>#</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center"><CircularProgress size={24} sx={{ m: 2 }} /></TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>No hay ventas registradas</Typography>
                  </TableCell>
                </TableRow>
              ) : displayed.map(sale => (
                <TableRow key={sale.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} fontFamily="monospace">
                      #{String(sale.sale_number).padStart(6, '0')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(sale.created_at).toLocaleString('es-CL')}
                    </Typography>
                  </TableCell>
                  <TableCell>{sale.customer_name || '—'}</TableCell>
                  <TableCell>{sale.seller?.full_name || '—'}</TableCell>
                  <TableCell>
                    <Chip label={PAY_LABELS[sale.payment_method] || sale.payment_method} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600} color="primary.main">{fmt(sale.total)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                      color={sale.status === 'COMPLETED' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => { setSelectedSale(sale); setShowTicket(false) }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Imprimir ticket">
                        <IconButton size="small" onClick={() => { setSelectedSale(sale); setShowTicket(true) }}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user?.role === 'ADMIN' && sale.status === 'COMPLETED' && (
                        <Tooltip title="Cancelar venta">
                          <IconButton size="small" color="error" onClick={() => handleCancel(sale.id)}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer: count + pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {total > 0
              ? `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} de ${total} venta${total !== 1 ? 's' : ''}`
              : 'Sin resultados'}
          </Typography>
          {totalPages > 1 && (
            <Stack>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                size="small"
                color="primary"
                siblingCount={1}
              />
            </Stack>
          )}
        </Box>
      </Card>

      {/* Sale detail / ticket dialog */}
      <Dialog open={!!selectedSale} onClose={() => setSelectedSale(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {showTicket
            ? `Ticket Venta #${String(selectedSale?.sale_number || '').padStart(6, '0')}`
            : `Detalle Venta #${String(selectedSale?.sale_number || '').padStart(6, '0')}`}
        </DialogTitle>
        <DialogContent>
          {selectedSale && (
            showTicket ? (
              <SaleTicket sale={selectedSale} />
            ) : (
              <Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                  <Box><Typography variant="caption" color="text.secondary">Cliente</Typography>
                    <Typography variant="body2">{selectedSale.customer_name || '—'}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Vendedor</Typography>
                    <Typography variant="body2">{selectedSale.seller?.full_name || '—'}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Fecha</Typography>
                    <Typography variant="body2">{new Date(selectedSale.created_at).toLocaleString('es-CL')}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Método de Pago</Typography>
                    <Typography variant="body2">{PAY_LABELS[selectedSale.payment_method]}</Typography></Box>
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Productos</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center">Cant.</TableCell>
                      <TableCell align="right">P. Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSale.items?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{fmt(item.unit_price)}</TableCell>
                        <TableCell align="right">{fmt(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Subtotal</Typography><Typography variant="body2">{fmt(selectedSale.subtotal)}</Typography>
                  </Box>
                  {selectedSale.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="success.main">Descuento</Typography>
                      <Typography variant="body2" color="success.main">-{fmt(selectedSale.discount)}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight={700}>Total</Typography>
                    <Typography fontWeight={700} color="primary.main">{fmt(selectedSale.total)}</Typography>
                  </Box>
                  {selectedSale.change_given > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Vuelto</Typography>
                      <Typography variant="body2">{fmt(selectedSale.change_given)}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )
          )}
        </DialogContent>
        <DialogContent sx={{ pt: 0, display: 'flex', gap: 1 }}>
          <Button onClick={() => setShowTicket(v => !v)} variant="outlined" size="small">
            {showTicket ? 'Ver Detalle' : 'Ver Ticket'}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
