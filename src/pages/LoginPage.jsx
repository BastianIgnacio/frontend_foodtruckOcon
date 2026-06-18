import { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../store/auth/actions'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector(s => s.auth)

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginRequest(form.username, form.password))
  }

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #e65100 0%, #ff833a 50%, #1565c0 100%)'
      }}
    >
      <Card sx={{ width: 380, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FastfoodIcon sx={{ fontSize: 56, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700} color="primary">
              FoodTruck Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de gestión de ventas
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Usuario" variant="outlined" margin="normal"
              value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoFocus
            />
            <TextField
              fullWidth label="Contraseña" variant="outlined" margin="normal"
              type={showPwd ? 'text' : 'password'}
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(v => !v)} edge="end">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              sx={{ mt: 2 }} disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            admin / admin123 · vendedor1 / vendedor123 · cliente1 / cliente123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
