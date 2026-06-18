import { useEffect, useState } from 'react'
import {
  Box, Typography, CircularProgress, Alert, Chip,
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, InputAdornment, IconButton, Tooltip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StorageIcon from '@mui/icons-material/Storage'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import { getDatabaseApi } from '../api'

const formatCell = (value) => {
  if (value === null || value === undefined) return <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>null</Typography>
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  const str = String(value)
  if (str.length > 120) return <Tooltip title={str}><span>{str.slice(0, 120)}…</span></Tooltip>
  return str
}

export default function BDPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getDatabaseApi()
      setTables(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al cargar la base de datos')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = tables.filter(t =>
    t.table.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon /> Base de Datos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar tabla..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: 200 }}
          />
          <Tooltip title="Recargar">
            <IconButton onClick={load} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filtered.map(({ table, columns, rows, count }) => (
            <Accordion key={table} disableGutters elevation={1}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography fontWeight={600} sx={{ fontFamily: 'monospace' }}>{table}</Typography>
                  <Chip
                    label={`${count} fila${count !== 1 ? 's' : ''}`}
                    size="small"
                    color={count > 0 ? 'primary' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {columns.length} col{columns.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {rows.length === 0 ? (
                  <Typography color="text.secondary" variant="body2" sx={{ p: 2 }}>
                    Sin registros
                  </Typography>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {columns.map(col => (
                            <TableCell
                              key={col}
                              sx={{
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                bgcolor: 'grey.100',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, i) => (
                          <TableRow key={i} hover>
                            {columns.map(col => (
                              <TableCell
                                key={col}
                                sx={{
                                  fontSize: '0.78rem',
                                  fontFamily: 'monospace',
                                  maxWidth: 260,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatCell(row[col])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
          {filtered.length === 0 && !loading && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No se encontraron tablas
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}
