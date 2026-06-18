import { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
  Alert, CircularProgress, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, LinearProgress, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import InventoryIcon from '@mui/icons-material/Inventory'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InputIcon from '@mui/icons-material/Input'
import SearchIcon from '@mui/icons-material/Search'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRawMaterials, createRawMaterial, updateRawMaterial, addRawMaterialEntry, deleteRawMaterial
} from '../store/rawMaterials/actions'

const emptyMaterial = { name: '', barcode: '', unit: '', quantity: 0, min_quantity: 0, supplier: '', cost_per_unit: 0 }
const emptyEntry = { quantity: '', cost_per_unit: '', supplier: '', notes: '' }

export default function RawMaterialsPage() {
  const dispatch = useDispatch()
  const { list: materials, loading, error } = useSelector(s => s.rawMaterials)

  const [materialDialog, setMaterialDialog] = useState(false)
  const [entryDialog, setEntryDialog] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState(null)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [form, setForm] = useState(emptyMaterial)
  const [entryForm, setEntryForm] = useState(emptyEntry)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { dispatch(fetchRawMaterials()) }, [dispatch])

  const openCreate = () => { setEditingMaterial(null); setForm(emptyMaterial); setFormError(null); setMaterialDialog(true) }
  const openEdit = (m) => {
    setEditingMaterial(m)
    setForm({ name: m.name, barcode: m.barcode || '', unit: m.unit, quantity: m.quantity, min_quantity: m.min_quantity, supplier: m.supplier || '', cost_per_unit: m.cost_per_unit })
    setFormError(null)
    setMaterialDialog(true)
  }

  const handleSaveMaterial = () => {
    if (!form.name || !form.unit) { setFormError('Nombre y unidad son requeridos'); return }
    setSaving(true)
    const data = { ...form, quantity: Number(form.quantity), min_quantity: Number(form.min_quantity), cost_per_unit: Number(form.cost_per_unit) }
    const cb = (err) => { setSaving(false); if (!err) setMaterialDialog(false); else setFormError(err) }
    if (editingMaterial) dispatch(updateRawMaterial(editingMaterial.id, data, cb))
    else dispatch(createRawMaterial(data, cb))
  }

  const handleDelete = () => {
    setSaving(true)
    dispatch(deleteRawMaterial(deleteDialog.id, (err) => {
      setSaving(false)
      if (!err) setDeleteDialog(null)
    }))
  }

  const handleAddEntry = () => {
    if (!entryForm.quantity || !entryForm.cost_per_unit) { setFormError('Cantidad y costo son requeridos'); return }
    setSaving(true)
    dispatch(addRawMaterialEntry(entryDialog.id, {
      quantity: Number(entryForm.quantity),
      cost_per_unit: Number(entryForm.cost_per_unit),
      supplier: entryForm.supplier || null,
      notes: entryForm.notes || null,
    }, (err) => {
      setSaving(false)
      if (!err) { setEntryDialog(null); setEntryForm(emptyEntry) }
      else setFormError(err)
    }))
  }

  const isLowStock = (m) => m.min_quantity > 0 && m.quantity <= m.min_quantity

  const filteredMaterials = materials.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || (m.barcode && m.barcode.toLowerCase().includes(q))
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon /> Materias Primas
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre o código de barra..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nueva Materia Prima
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {materials.filter(isLowStock).length > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
          Stock bajo: {materials.filter(isLowStock).map(m => m.name).join(', ')}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Cód. Barra</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell align="right">Stock Actual</TableCell>
                  <TableCell align="right">Stock Mínimo</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell align="right">Costo/Unidad</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaterials.map(m => {
                  const pct = m.min_quantity > 0 ? Math.min(100, (m.quantity / (m.min_quantity * 2)) * 100) : 100
                  return (
                    <TableRow key={m.id} hover sx={{ bgcolor: isLowStock(m) ? 'warning.light' + '22' : 'inherit' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isLowStock(m) && <WarningAmberIcon fontSize="small" color="warning" />}
                          <Typography fontWeight={isLowStock(m) ? 700 : 400}>{m.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: m.barcode ? 'text.primary' : 'text.disabled' }}>
                          {m.barcode || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{m.unit}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color={isLowStock(m) ? 'error.main' : 'success.main'}>
                          {m.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{m.min_quantity}</TableCell>
                      <TableCell>{m.supplier || '—'}</TableCell>
                      <TableCell align="right">${Number(m.cost_per_unit).toLocaleString('es-CL')}</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <LinearProgress
                          variant="determinate" value={pct}
                          color={pct < 30 ? 'error' : pct < 60 ? 'warning' : 'success'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEdit(m)}><EditIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Registrar recepción">
                            <IconButton size="small" color="primary"
                              onClick={() => { setEntryDialog(m); setEntryForm({ ...emptyEntry, supplier: m.supplier || '', cost_per_unit: m.cost_per_unit }); setFormError(null) }}>
                              <InputIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => setDeleteDialog(m)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredMaterials.length === 0 && (
                  <TableRow><TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {search ? 'Sin resultados para la búsqueda' : 'No hay materias primas'}
                    </Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Material Dialog */}
      <Dialog open={materialDialog} onClose={() => setMaterialDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMaterial ? 'Editar Materia Prima' : 'Nueva Materia Prima'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={8}><TextField fullWidth label="Nombre *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Unidad *" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg, L, unid" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Código de barra" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Ej: 7891234567890" /></Grid>
            {!editingMaterial && (
              <Grid item xs={6}><TextField fullWidth label="Stock inicial" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></Grid>
            )}
            <Grid item xs={editingMaterial ? 12 : 6}><TextField fullWidth label="Stock mínimo (alerta)" type="number" value={form.min_quantity} onChange={e => setForm(f => ({ ...f, min_quantity: e.target.value }))} /></Grid>
            <Grid item xs={8}><TextField fullWidth label="Proveedor" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Costo/Unidad" type="number" value={form.cost_per_unit} onChange={e => setForm(f => ({ ...f, cost_per_unit: e.target.value }))} InputProps={{ startAdornment: '$' }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaterialDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveMaterial} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : (editingMaterial ? 'Guardar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar Materia Prima</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas eliminar <strong>{deleteDialog?.name}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Entry Dialog */}
      <Dialog open={!!entryDialog} onClose={() => setEntryDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Recepción: {entryDialog?.name}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField fullWidth label={`Cantidad recibida (${entryDialog?.unit})`} type="number" margin="normal" autoFocus
            value={entryForm.quantity} onChange={e => setEntryForm(f => ({ ...f, quantity: e.target.value }))} />
          <TextField fullWidth label="Costo por unidad" type="number" margin="normal"
            value={entryForm.cost_per_unit} onChange={e => setEntryForm(f => ({ ...f, cost_per_unit: e.target.value }))}
            InputProps={{ startAdornment: '$' }} />
          <TextField fullWidth label="Proveedor" margin="normal"
            value={entryForm.supplier} onChange={e => setEntryForm(f => ({ ...f, supplier: e.target.value }))} />
          <TextField fullWidth label="Notas" multiline rows={2} margin="normal"
            value={entryForm.notes} onChange={e => setEntryForm(f => ({ ...f, notes: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntryDialog(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddEntry} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Registrar Recepción'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
