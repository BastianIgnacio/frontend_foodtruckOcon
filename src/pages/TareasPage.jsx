import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  Box, Typography, Button, Paper, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Tooltip, Stack,
  CircularProgress, Alert, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PersonIcon from '@mui/icons-material/Person'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/tasks/actions'
import { fetchUsers } from '../store/users/actions'

const COLUMNS = [
  { key: 'PENDING',     label: 'Pendiente', color: '#ed6c02', bg: '#fff3e0', border: '#ffcc80', dragOver: '#ffe0b2' },
  { key: 'IN_PROGRESS', label: 'En curso',  color: '#1976d2', bg: '#e3f2fd', border: '#90caf9', dragOver: '#bbdefb' },
  { key: 'DONE',        label: 'Hecho',     color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', dragOver: '#c8e6c9' },
]

const EMPTY_FORM = { title: '', description: '', assigned_user_id: '' }

export default function TareasPage() {
  const dispatch = useDispatch()
  const { list: tasks, loading, error } = useSelector(s => s.tasks)
  const { list: users } = useSelector(s => s.users)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const adminUsers = users.filter(u => u.role === 'ADMIN' && u.is_active)

  useEffect(() => {
    dispatch(fetchTasks())
    dispatch(fetchUsers())
  }, [dispatch])

  const tasksByStatus = {
    PENDING:     tasks.filter(t => t.status === 'PENDING'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE:        tasks.filter(t => t.status === 'DONE'),
  }

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return
    dispatch(updateTask(parseInt(draggableId), { status: destination.droppableId }))
  }

  const openCreate = () => {
    setEditingTask(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setDialogOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      assigned_user_id: task.assigned_user_id || '',
    })
    setFormError('')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingTask(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleSave = () => {
    if (!form.title.trim()) {
      setFormError('El título es obligatorio')
      return
    }
    setSaving(true)
    setFormError('')
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      assigned_user_id: form.assigned_user_id || null,
    }
    if (editingTask) {
      dispatch(updateTask(editingTask.id, payload, (err) => {
        setSaving(false)
        if (err) setFormError(err)
        else closeDialog()
      }))
    } else {
      dispatch(createTask(payload, (err) => {
        setSaving(false)
        if (err) setFormError(err)
        else closeDialog()
      }))
    }
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    dispatch(deleteTask(deleteConfirm.id))
    setDeleteConfirm(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700}>Tareas</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nueva Tarea
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, alignItems: 'start' }}>
            {COLUMNS.map((col) => (
              <Paper
                key={col.key}
                elevation={0}
                sx={{
                  bgcolor: col.bg,
                  borderRadius: 2,
                  p: 2,
                  border: `1.5px solid ${col.border}`,
                  minHeight: 300,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color, flexShrink: 0 }} />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: col.color, flex: 1 }}>
                    {col.label}
                  </Typography>
                  <Chip
                    label={tasksByStatus[col.key].length}
                    size="small"
                    sx={{ bgcolor: col.color, color: 'white', fontWeight: 700, height: 20, fontSize: 11, minWidth: 24 }}
                  />
                </Box>

                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <Stack
                      spacing={1.5}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 80,
                        borderRadius: 1,
                        p: 0.5,
                        transition: 'background-color 0.15s ease',
                        bgcolor: snapshot.isDraggingOver ? col.dragOver : 'transparent',
                      }}
                    >
                      {tasksByStatus[col.key].length === 0 && !snapshot.isDraggingOver && (
                        <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ py: 4 }}>
                          Sin tareas
                        </Typography>
                      )}

                      {tasksByStatus[col.key].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              elevation={snapshot.isDragging ? 8 : 2}
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: 'white',
                                opacity: snapshot.isDragging ? 0.92 : 1,
                                boxShadow: snapshot.isDragging
                                  ? '0 8px 24px rgba(0,0,0,0.18)'
                                  : undefined,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                {/* Drag handle */}
                                <Box
                                  {...provided.dragHandleProps}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'text.disabled',
                                    cursor: 'grab',
                                    flexShrink: 0,
                                    mt: 0.1,
                                    '&:active': { cursor: 'grabbing' },
                                  }}
                                >
                                  <DragIndicatorIcon sx={{ fontSize: 16 }} />
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1, lineHeight: 1.4, mr: 0.5 }}>
                                      {task.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                                      <Tooltip title="Editar">
                                        <IconButton size="small" onClick={() => openEdit(task)} sx={{ p: 0.4 }}>
                                          <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Eliminar">
                                        <IconButton size="small" onClick={() => setDeleteConfirm(task)} sx={{ p: 0.4, color: 'error.main' }}>
                                          <DeleteIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>

                                  {task.description && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                      {task.description}
                                    </Typography>
                                  )}

                                  {task.assigned_user && (
                                    <>
                                      <Divider sx={{ my: 0.75 }} />
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                          {task.assigned_user.full_name}
                                        </Typography>
                                      </Box>
                                    </>
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              </Paper>
            ))}
          </Box>
        </DragDropContext>
      )}

      {/* Diálogo crear/editar */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            fullWidth
            required
            autoFocus
            sx={{ mt: 1, mb: 2 }}
            error={!!formError && !form.title.trim()}
          />
          <TextField
            label="Descripción (opcional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Responsable</InputLabel>
            <Select
              value={form.assigned_user_id}
              onChange={e => setForm(f => ({ ...f, assigned_user_id: e.target.value }))}
              label="Responsable"
            >
              <MenuItem value=""><em>Sin asignar</em></MenuItem>
              {adminUsers.map(u => (
                <MenuItem key={u.id} value={u.id}>{u.full_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
          >
            {saving ? <CircularProgress size={20} /> : (editingTask ? 'Guardar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo confirmación eliminar */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar Tarea</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Eliminar la tarea <strong>"{deleteConfirm?.title}"</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
