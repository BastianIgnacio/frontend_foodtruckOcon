import { useEffect, useState } from 'react'
import {
  Box, Card, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import PersonIcon from '@mui/icons-material/Person'
import PeopleIcon from '@mui/icons-material/People'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/users/actions'

const ROLES = ['VENDEDOR', 'ADMIN']
const ROLE_LABELS = { ADMIN: 'Administrador', VENDEDOR: 'Vendedor' }
const ROLE_COLORS = { ADMIN: 'error', VENDEDOR: 'primary' }

const emptyForm = { username: '', email: '', full_name: '', password: '', role: 'VENDEDOR' }

export default function UsersPage() {
  const dispatch = useDispatch()
  const { list: users, loading, error } = useSelector(s => s.users)
  const { user: currentUser } = useSelector(s => s.auth)

  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => { dispatch(fetchUsers()) }, [dispatch])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(null); setDialog(true) }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ username: u.username, email: u.email, full_name: u.full_name, password: '', role: u.role })
    setFormError(null)
    setDialog(true)
  }

  const handleSave = () => {
    if (!form.full_name || !form.email || (!editing && !form.password)) {
      setFormError('Todos los campos obligatorios deben completarse')
      return
    }
    setSaving(true)
    const data = { ...form }
    if (editing && !data.password) delete data.password
    const cb = (err) => { setSaving(false); if (!err) setDialog(false); else setFormError(err) }
    if (editing) dispatch(updateUser(editing.id, data, cb))
    else dispatch(createUser(data, cb))
  }

  const handleToggleActive = (u) => {
    if (u.id === currentUser?.id) return
    const action = u.is_active ? 'desactivar' : 'activar'
    if (window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} a ${u.full_name}?`)) {
      if (u.is_active) dispatch(deleteUser(u.id))
      else dispatch(updateUser(u.id, { is_active: true }, () => {}))
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon /> Gestión de Usuarios
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nuevo Usuario
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell>Nombre</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} sx={{ m: 2 }} /></TableCell></TableRow>
              )}
              {!loading && users.map(u => (
                <TableRow key={u.id} hover sx={{ opacity: u.is_active ? 1 : 0.6 }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography fontWeight={600}>{u.full_name}</Typography>
                      {u.id === currentUser?.id && <Chip label="Tú" size="small" color="info" />}
                    </Box>
                  </TableCell>
                  <TableCell><Typography fontFamily="monospace">{u.username}</Typography></TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={ROLE_LABELS[u.role] || u.role} color={ROLE_COLORS[u.role] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.is_active ? 'Activo' : 'Inactivo'}
                      color={u.is_active ? 'success' : 'default'}
                      size="small"
                      variant={u.is_active ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(u.created_at).toLocaleDateString('es-CL')}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      {u.id !== currentUser?.id && (
                        <Tooltip title={u.is_active ? 'Desactivar' : 'Activar'}>
                          <IconButton
                            size="small"
                            color={u.is_active ? 'error' : 'success'}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.is_active ? <PersonOffIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && users.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>No hay usuarios</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField fullWidth label="Nombre completo *" margin="normal"
            value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          <TextField fullWidth label="Nombre de usuario *" margin="normal" disabled={!!editing}
            value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <TextField fullWidth label="Email *" type="email" margin="normal"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <TextField
            fullWidth label={editing ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
            type="password" margin="normal"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} label="Rol">
              {ROLES.map(r => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : (editing ? 'Guardar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
