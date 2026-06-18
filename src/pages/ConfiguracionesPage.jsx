import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Button, Tooltip, IconButton
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import PrintIcon from '@mui/icons-material/Print'
import RefreshIcon from '@mui/icons-material/Refresh'
import { getPrintersApi, setDefaultPrinterApi } from '../api'

export default function ConfiguracionesPage() {
  const [printers, setPrinters] = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getPrintersApi()
      setPrinters(data)
      const current = data.find(p => p.is_default)
      setSelected(current ? current.name : '')
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al obtener las impresoras instaladas')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await setDefaultPrinterApi(selected)
      setSuccess('Impresora por defecto guardada')
      setPrinters(printers.map(p => ({ ...p, is_default: p.name === selected })))
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al guardar la impresora por defecto')
    }
    setSaving(false)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon /> Configuraciones
        </Typography>
        <Tooltip title="Actualizar lista de impresoras">
          <IconButton onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PrintIcon fontSize="small" /> Impresora por defecto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona la impresora de este computador que se usará al imprimir tickets de venta.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={28} /></Box>
          ) : printers.length === 0 ? (
            <Alert severity="warning">No se detectaron impresoras instaladas en este computador.</Alert>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="printer-select-label">Impresora</InputLabel>
                <Select
                  labelId="printer-select-label"
                  label="Impresora"
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                >
                  {printers.map(p => (
                    <MenuItem key={p.name} value={p.name}>
                      {p.name}{p.is_default ? ' (actual)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !selected || printers.find(p => p.is_default)?.name === selected}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar como predeterminada'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
